import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In, Not } from 'typeorm';
import { Role } from '../entities/role.entity';
import { DepartmentRole } from '../entities/department-role.entity';
import { UserRole } from '../../users/entities/user-role.entity';
import { RoleActionPermission } from '../../permissions/entities/role-action-permission.entity';
import { RoleProjectPermission } from '../../permissions/entities/role-project-permission.entity';
import { ApprovalStep } from '../../workflows/entities/approval-step.entity';
import { AuditService } from '../../audit/services/audit.service';
import { ConflictException } from '@nestjs/common';

export class RemoveRoleDto {
  mode: 'MERGE' | 'REPLACE';
  destinationRoleId: number;
}

@Injectable()
export class RoleMigrationService {
  private readonly logger = new Logger(RoleMigrationService.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(DepartmentRole)
    private readonly deptRoleRepo: Repository<DepartmentRole>,
    @InjectRepository(UserRole)
    private readonly userRoleRepo: Repository<UserRole>,
    @InjectRepository(RoleActionPermission)
    private readonly rapRepo: Repository<RoleActionPermission>,
    @InjectRepository(RoleProjectPermission)
    private readonly rppRepo: Repository<RoleProjectPermission>,
    @InjectRepository(ApprovalStep)
    private readonly approvalStepRepo: Repository<ApprovalStep>,
    private readonly auditService: AuditService,
    private readonly dataSource: DataSource,
  ) {}

  async getDependencyCounts(roleId: number): Promise<{
    users: number;
    permissions: number;
    projectPermissions: number;
    approvalSteps: number;
    departmentMappings: number;
    total: number;
  }> {
    const [
      users,
      permissions,
      projectPermissions,
      approvalSteps,
      departmentMappings,
    ] = await Promise.all([
      this.userRoleRepo.count({ where: { roleId } }),
      this.rapRepo.count({ where: { roleId } }),
      this.rppRepo.count({ where: { roleId } }),
      this.approvalStepRepo.count({ where: { roleId } }),
      this.deptRoleRepo.count({ where: { roleId } }),
    ]);
    return {
      users,
      permissions,
      projectPermissions,
      approvalSteps,
      departmentMappings,
      total:
        users +
        permissions +
        projectPermissions +
        approvalSteps +
        departmentMappings,
    };
  }

  async getAutoMergeCandidates(roleId: number): Promise<Role | null> {
    const role = await this.roleRepo.findOne({
      where: { id: roleId, deletedAt: null },
    });
    if (!role) return null;

    const sameLevelRoles = await this.roleRepo.find({
      where: {
        hierarchyLevelRank: role.hierarchyLevelRank,
        id: Not(roleId),
        deletedAt: null,
      },
      order: { name: 'ASC' },
      take: 1,
    });
    if (sameLevelRoles.length > 0) return sameLevelRoles[0];

    const nearestLevelRoles = await this.roleRepo.find({
      where: { deletedAt: null, id: Not(roleId) },
      order: { hierarchyLevelRank: 'ASC', name: 'ASC' },
      take: 1,
    });
    return nearestLevelRoles.length > 0 ? nearestLevelRoles[0] : null;
  }

  async remove(
    roleId: number,
    dto: RemoveRoleDto,
    performedBy?: string,
  ): Promise<{ message: string; destinationRole: Role }> {
    const sourceRole = await this.roleRepo.findOne({
      where: { id: roleId, deletedAt: null },
    });
    if (!sourceRole) {
      throw new NotFoundException('Role not found');
    }

    const destinationRole = await this.roleRepo.findOne({
      where: { id: dto.destinationRoleId, deletedAt: null },
    });
    if (!destinationRole) {
      throw new NotFoundException('Destination role not found');
    }

    if (dto.destinationRoleId === roleId) {
      throw new BadRequestException('Cannot merge/replace a role with itself');
    }

    const deps = await this.getDependencyCounts(roleId);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (dto.mode === 'MERGE') {
        await this.executeMerge(queryRunner, roleId, dto.destinationRoleId);
      } else {
        await this.executeReplace(queryRunner, roleId, dto.destinationRoleId);
      }

      await queryRunner.manager.softDelete(Role, roleId);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Role migration failed: ${(err as Error).message}`,
        (err as Error).stack,
      );
      throw err;
    } finally {
      await queryRunner.release();
    }

    try {
      await this.auditService.createLog({
        entityName: 'Role',
        entityId: String(roleId),
        action: dto.mode === 'MERGE' ? 'ROLE_MERGED' : 'ROLE_REPLACED',
        oldValue: { id: roleId, name: sourceRole.name },
        newValue: {
          destinationRoleId: dto.destinationRoleId,
          destinationRoleName: destinationRole.name,
          mode: dto.mode,
          usersMigrated: deps.users,
          permissionsMerged: dto.mode === 'MERGE' ? deps.permissions : 0,
          projectPermissionsMigrated: deps.projectPermissions,
          approvalStepsMigrated: deps.approvalSteps,
          departmentMappingsMigrated: deps.departmentMappings,
        },
        performedBy,
        source: 'role-migration',
      });
    } catch (auditErr) {
      this.logger.warn(
        `Failed to create audit log: ${(auditErr as Error).message}`,
      );
    }

    return {
      message:
        dto.mode === 'MERGE'
          ? `Role "${sourceRole.name}" merged into "${destinationRole.name}"`
          : `Role "${sourceRole.name}" replaced by "${destinationRole.name}"`,
      destinationRole,
    };
  }

  async checkAutoMerge(
    roleId: number,
  ): Promise<{ autoMerge: boolean; message?: string; destinationRole?: Role }> {
    const deps = await this.getDependencyCounts(roleId);
    if (deps.total > 0) {
      return { autoMerge: false };
    }

    const candidate = await this.getAutoMergeCandidates(roleId);
    if (!candidate) {
      return {
        autoMerge: true,
        message: `Role has no dependencies. No other role found to merge into.`,
      };
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.softDelete(Role, roleId);
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    return {
      autoMerge: true,
      message: `Role has no dependencies. Automatically merged into "${candidate.name}".`,
      destinationRole: candidate,
    };
  }

  private async executeMerge(
    queryRunner: any,
    sourceRoleId: number,
    destRoleId: number,
  ): Promise<void> {
    const manager = queryRunner.manager;

    // 1. Migrate UserRole: update source → dest, remove duplicates
    await manager.query(
      `WITH updated AS (
         UPDATE user_roles
         SET role_id = $2
         WHERE role_id = $1
         RETURNING user_id, department_id, role_id
       )
       DELETE FROM user_roles ur
       USING updated u
       WHERE ur.user_id = u.user_id
         AND ur.department_id IS NOT DISTINCT FROM u.department_id
         AND ur.role_id = $2
         AND ur.id NOT IN (
           SELECT MIN(id) FROM user_roles
           WHERE user_id = u.user_id
             AND department_id IS NOT DISTINCT FROM u.department_id
             AND role_id = $2
           GROUP BY user_id, department_id
         )`,
      [sourceRoleId, destRoleId],
    );

    // 2. Migrate RoleActionPermission: copy source → dest, skip duplicates
    await manager.query(
      `INSERT INTO role_action_permissions (role_id, module_id, sub_module_id, action_group_id, action_id)
       SELECT $2, rap.module_id, rap.sub_module_id, rap.action_group_id, rap.action_id
       FROM role_action_permissions rap
       WHERE rap.role_id = $1
         AND NOT EXISTS (
           SELECT 1 FROM role_action_permissions dest
           WHERE dest.role_id = $2
             AND dest.action_id = rap.action_id
         )`,
      [sourceRoleId, destRoleId],
    );

    // 3. Migrate RoleProjectPermission: copy source → dest, skip duplicates
    await manager.query(
      `INSERT INTO role_project_permissions (role_id, project_id, module_id, sub_module_id, action_id)
       SELECT $2, rpp.project_id, rpp.module_id, rpp.sub_module_id, rpp.action_id
       FROM role_project_permissions rpp
       WHERE rpp.role_id = $1
         AND NOT EXISTS (
           SELECT 1 FROM role_project_permissions dest
           WHERE dest.role_id = $2
             AND dest.project_id = rpp.project_id
             AND dest.module_id = rpp.module_id
             AND dest.sub_module_id IS NOT DISTINCT FROM rpp.sub_module_id
             AND dest.action_id = rpp.action_id
         )`,
      [sourceRoleId, destRoleId],
    );

    // 4. Migrate ApprovalStep
    await manager.update(
      ApprovalStep,
      { roleId: sourceRoleId },
      { roleId: destRoleId },
    );

    // 5. Migrate DepartmentRole: update source → dest, remove duplicates
    await manager.query(
      `WITH updated AS (
         UPDATE department_roles
         SET role_id = $2
         WHERE role_id = $1
         RETURNING department_id, role_id
       )
       DELETE FROM department_roles dr
       USING updated u
       WHERE dr.department_id = u.department_id
         AND dr.role_id = $2
         AND dr.department_id = u.department_id
         AND dr.role_id = $1`,
      [sourceRoleId, destRoleId],
    );
  }

  private async executeReplace(
    queryRunner: any,
    sourceRoleId: number,
    destRoleId: number,
  ): Promise<void> {
    const manager = queryRunner.manager;

    // 1. Migrate UserRole: update source → dest, remove duplicates
    await manager.query(
      `WITH updated AS (
         UPDATE user_roles
         SET role_id = $2
         WHERE role_id = $1
         RETURNING user_id, department_id, role_id
       )
       DELETE FROM user_roles ur
       USING updated u
       WHERE ur.user_id = u.user_id
         AND ur.department_id IS NOT DISTINCT FROM u.department_id
         AND ur.role_id = $2
         AND ur.id NOT IN (
           SELECT MIN(id) FROM user_roles
           WHERE user_id = u.user_id
             AND department_id IS NOT DISTINCT FROM u.department_id
             AND role_id = $2
           GROUP BY user_id, department_id
         )`,
      [sourceRoleId, destRoleId],
    );

    // 2. Migrate ApprovalStep
    await manager.update(
      ApprovalStep,
      { roleId: sourceRoleId },
      { roleId: destRoleId },
    );

    // 3. Migrate DepartmentRole
    await manager.query(
      `WITH updated AS (
         UPDATE department_roles
         SET role_id = $2
         WHERE role_id = $1
         RETURNING department_id, role_id
       )
       DELETE FROM department_roles dr
       USING updated u
       WHERE dr.department_id = u.department_id
         AND dr.role_id = $2
         AND dr.department_id = u.department_id
         AND dr.role_id = $1`,
      [sourceRoleId, destRoleId],
    );
  }
}
