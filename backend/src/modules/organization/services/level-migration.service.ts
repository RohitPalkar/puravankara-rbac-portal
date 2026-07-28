import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../entities/department.entity';
import { DepartmentHierarchyLevel } from '../entities/department-hierarchy-level.entity';
import { Role } from '../entities/role.entity';
import { RoleMigrationService } from './role-migration.service';
import { AuditService } from '../../audit/services/audit.service';
import { PermissionCacheService } from '../../permissions/services/permission-cache.service';
import { UserRole } from '../../users/entities/user-role.entity';
import { RoleActionPermission } from '../../permissions/entities/role-action-permission.entity';
import { RoleProjectPermission } from '../../permissions/entities/role-project-permission.entity';
import { ApprovalStep } from '../../workflows/entities/approval-step.entity';
import { UserReportingLine } from '../../users/entities/user-reporting-line.entity';

export interface LevelImpactPreview {
  sourceLevel: {
    id: number;
    levelNumber: number;
    roleName: string;
    roleId: number;
  };
  department: {
    id: number;
    name: string;
    zones: { zoneId: number; name: string }[];
  };
  dependencies: {
    users: { count: number };
    permissions: {
      count: number;
      modules: { moduleId: number; name: string; count: number }[];
    };
    projects: { count: number };
    approvals: { count: number; active: number };
    reporting: { count: number };
    isDepartmentAdmin: boolean;
  };
  autoMerge: {
    eligible: boolean;
    candidateLevel: {
      id: number;
      levelNumber: number;
      roleName: string;
    } | null;
    direction: 'up' | 'down' | null;
  };
  protected: boolean;
  protectionReason: string | null;
  availableDestinations: {
    id: number;
    levelNumber: number;
    roleName: string;
  }[];
}

export interface LevelRemoveResult {
  message: string;
  mode: 'MERGE' | 'REPLACE';
  destinationLevel: { id: number; levelNumber: number; roleName: string };
  sourceLevel: { id: number; levelNumber: number; roleName: string };
}

export class RemoveLevelDto {
  mode: 'MERGE' | 'REPLACE';
  destinationLevelNumber: number;
}

@Injectable()
export class LevelMigrationService {
  private readonly logger = new Logger(LevelMigrationService.name);

  constructor(
    @InjectRepository(Department)
    private readonly deptRepo: Repository<Department>,
    @InjectRepository(DepartmentHierarchyLevel)
    private readonly levelRepo: Repository<DepartmentHierarchyLevel>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(UserRole)
    private readonly userRoleRepo: Repository<UserRole>,
    @InjectRepository(RoleActionPermission)
    private readonly rapRepo: Repository<RoleActionPermission>,
    @InjectRepository(RoleProjectPermission)
    private readonly rppRepo: Repository<RoleProjectPermission>,
    @InjectRepository(ApprovalStep)
    private readonly approvalStepRepo: Repository<ApprovalStep>,
    @InjectRepository(UserReportingLine)
    private readonly reportingLineRepo: Repository<UserReportingLine>,
    private readonly roleMigrationService: RoleMigrationService,
    private readonly auditService: AuditService,
    private readonly cacheService: PermissionCacheService,
  ) {}

  async getImpactPreview(
    departmentId: number,
    levelNumber: number,
  ): Promise<LevelImpactPreview> {
    const dept = await this.deptRepo.findOne({
      where: { id: departmentId, deletedAt: null },
      relations: { zone: true },
    });
    if (!dept) throw new NotFoundException('Department not found');

    const sourceLevel = await this.levelRepo.findOne({
      where: { departmentId, levelNumber, isActive: true },
    });
    if (!sourceLevel) throw new NotFoundException('Hierarchy level not found');

    const zones = [
      {
        zoneId: dept.zoneId,
        name: dept.zone?.name ?? `Zone #${dept.zoneId}`,
      },
    ];

    const roleId = sourceLevel.roleId;

    const [userCount, permCount, rppCount, approvalCount, reportingCount] =
      await Promise.all([
        this.userRoleRepo.count({ where: { roleId } }),
        this.rapRepo.count({ where: { roleId } }),
        this.rppRepo.count({ where: { roleId } }),
        this.approvalStepRepo.count({ where: { roleId } }),
        this.reportingLineRepo.count({ where: { levelRank: levelNumber } }),
      ]);

    const permissionModules = await this.rapRepo
      .createQueryBuilder('rap')
      .select('rap.module_id', 'moduleId')
      .addSelect('COUNT(rap.id)', 'count')
      .where('rap.role_id = :roleId', { roleId })
      .groupBy('rap.module_id')
      .getRawMany();

    const activeApprovals = await this.approvalStepRepo.count({
      where: { roleId, deletedAt: null },
    });

    const projectRow = await this.rppRepo
      .createQueryBuilder('rpp')
      .where('rpp.role_id = :roleId', { roleId })
      .select('COUNT(DISTINCT rpp.project_id)', 'count')
      .getRawOne();
    const projectCount = Number(projectRow?.count ?? 0);

    const isDepartmentAdmin = dept.departmentAdminId
      ? !!(await this.userRoleRepo.findOne({
          where: { userId: dept.departmentAdminId, roleId },
        }))
      : false;

    const allLevels = await this.levelRepo.find({
      where: { departmentId, isActive: true },
      order: { levelNumber: 'ASC' },
    });

    const availableDestinations = allLevels
      .filter((l) => l.levelNumber !== levelNumber)
      .map((l) => ({
        id: l.id,
        levelNumber: l.levelNumber,
        roleName: l.roleName,
      }));

    const protectionResult = await this.validateLevelDeletable(
      departmentId,
      levelNumber,
      allLevels,
      roleId,
    );

    const autoMergeResult = this.findAutoMergeCandidate(allLevels, levelNumber);

    return {
      sourceLevel: {
        id: sourceLevel.id,
        levelNumber: sourceLevel.levelNumber,
        roleName: sourceLevel.roleName,
        roleId: sourceLevel.roleId,
      },
      department: { id: dept.id, name: dept.name, zones },
      dependencies: {
        users: { count: userCount },
        permissions: {
          count: permCount + rppCount,
          modules: permissionModules.map((m) => ({
            moduleId: m.moduleId,
            name: `Module #${m.moduleId}`,
            count: m.count,
          })),
        },
        projects: { count: projectCount },
        approvals: { count: approvalCount, active: activeApprovals },
        reporting: { count: reportingCount },
        isDepartmentAdmin,
      },
      autoMerge: {
        eligible:
          userCount === 0 &&
          permCount === 0 &&
          approvalCount === 0 &&
          reportingCount === 0,
        candidateLevel: autoMergeResult.candidate,
        direction: autoMergeResult.direction,
      },
      protected: !protectionResult.deletable,
      protectionReason: protectionResult.reason,
      availableDestinations,
    };
  }

  async remove(
    departmentId: number,
    levelNumber: number,
    dto: RemoveLevelDto,
    performedBy?: string,
  ): Promise<LevelRemoveResult> {
    const dept = await this.deptRepo.findOne({
      where: { id: departmentId, deletedAt: null },
      relations: { zone: true },
    });
    if (!dept) throw new NotFoundException('Department not found');

    const sourceLevel = await this.levelRepo.findOne({
      where: { departmentId, levelNumber, isActive: true },
    });
    if (!sourceLevel) throw new NotFoundException('Hierarchy level not found');

    const allLevels = await this.levelRepo.find({
      where: { departmentId, isActive: true },
      order: { levelNumber: 'ASC' },
    });

    const protectionResult = await this.validateLevelDeletable(
      departmentId,
      levelNumber,
      allLevels,
      sourceLevel.roleId,
    );
    if (!protectionResult.deletable) {
      throw new BadRequestException(protectionResult.reason);
    }

    if (dto.destinationLevelNumber === levelNumber) {
      throw new BadRequestException('Cannot merge/replace a level with itself');
    }

    const destinationLevel = allLevels.find(
      (l) =>
        l.levelNumber === dto.destinationLevelNumber && l.id !== sourceLevel.id,
    );
    if (!destinationLevel) {
      throw new BadRequestException('Destination hierarchy level not found');
    }
    if (!destinationLevel.isActive) {
      throw new BadRequestException('Cannot merge/replace into an inactive level');
    }

    // Collect affected user IDs before migration (for cache invalidation)
    const affectedUserRoles = await this.userRoleRepo.find({
      where: { roleId: sourceLevel.roleId },
      select: { userId: true },
    });
    const affectedUserIds = [
      ...new Set(affectedUserRoles.map((ur) => ur.userId)),
    ];

    // Delegate to RoleMigrationService for all data movement
    const roleResult = await this.roleMigrationService.remove(
      sourceLevel.roleId,
      { mode: dto.mode, destinationRoleId: destinationLevel.roleId },
      performedBy,
    );

    // Soft-delete the hierarchy level
    await this.levelRepo.update(sourceLevel.id, {
      isActive: false,
    });

    // Create audit log
    const zones = dept.zone ? [dept.zone.name] : [];

    try {
      await this.auditService.createLog({
        entityName: 'HierarchyLevel',
        entityId: `dept-${departmentId}-level-${levelNumber}`,
        action: dto.mode === 'MERGE' ? 'LEVEL_MERGED' : 'LEVEL_REPLACED',
        oldValue: {
          department: { id: dept.id, name: dept.name },
          sourceLevel: {
            id: sourceLevel.id,
            levelNumber: sourceLevel.levelNumber,
            roleName: sourceLevel.roleName,
          },
          zones,
        },
        newValue: {
          migrationMode: dto.mode,
          destinationLevel: {
            id: destinationLevel.id,
            levelNumber: destinationLevel.levelNumber,
            roleName: destinationLevel.roleName,
          },
          usersMigrated: affectedUserIds.length,
          rolesMigrated: 1,
          performedBy,
        },
        performedBy,
        source: 'level-migration',
      });
    } catch (auditErr) {
      this.logger.warn(
        `Failed to create audit log: ${(auditErr as Error).message}`,
      );
    }

    // Invalidate permission cache for affected users
    for (const userId of affectedUserIds) {
      try {
        await this.cacheService.invalidateByPattern(`permission:${userId}:*`);
      } catch {
        // cache invalidation is best-effort
      }
    }

    return {
      message: roleResult.message,
      mode: dto.mode,
      destinationLevel: {
        id: destinationLevel.id,
        levelNumber: destinationLevel.levelNumber,
        roleName: destinationLevel.roleName,
      },
      sourceLevel: {
        id: sourceLevel.id,
        levelNumber: sourceLevel.levelNumber,
        roleName: sourceLevel.roleName,
      },
    };
  }

  async checkAutoMerge(
    departmentId: number,
    levelNumber: number,
  ): Promise<{
    autoMerge: boolean;
    message?: string;
    destinationLevel?: { id: number; levelNumber: number; roleName: string };
  }> {
    const impact = await this.getImpactPreview(departmentId, levelNumber);
    if (!impact.autoMerge.eligible || !impact.autoMerge.candidateLevel) {
      return { autoMerge: false };
    }

    return {
      autoMerge: true,
      message: `Level has no dependencies. Ready for auto-merge into "${impact.autoMerge.candidateLevel.roleName}".`,
      destinationLevel: {
        id: impact.autoMerge.candidateLevel.id,
        levelNumber: impact.autoMerge.candidateLevel.levelNumber,
        roleName: impact.autoMerge.candidateLevel.roleName,
      },
    };
  }

  async rename(
    departmentId: number,
    levelNumber: number,
    newRoleName: string,
  ): Promise<any> {
    const dept = await this.deptRepo.findOne({
      where: { id: departmentId, deletedAt: null },
    });
    if (!dept) throw new NotFoundException('Department not found');

    const level = await this.levelRepo.findOne({
      where: { departmentId, levelNumber, isActive: true },
    });
    if (!level) throw new NotFoundException('Hierarchy level not found');

    const duplicate = await this.levelRepo.findOne({
      where: { departmentId, roleName: newRoleName, isActive: true },
    });
    if (duplicate && duplicate.id !== level.id) {
      throw new BadRequestException(
        `Role name "${newRoleName}" already exists in this department`,
      );
    }

    const oldName = level.roleName;
    level.roleName = newRoleName;
    await this.levelRepo.save(level);

    try {
      await this.auditService.createLog({
        entityName: 'HierarchyLevel',
        entityId: `dept-${departmentId}-level-${levelNumber}`,
        action: 'LEVEL_RENAMED',
        oldValue: { roleName: oldName, levelNumber, departmentId },
        newValue: { roleName: newRoleName, levelNumber, departmentId },
      });
    } catch (auditErr) {
      this.logger.warn(`Audit log failed: ${(auditErr as Error).message}`);
    }

    return {
      message: `Renamed "${oldName}" to "${newRoleName}"`,
      id: level.id,
      levelNumber: level.levelNumber,
      roleName: level.roleName,
      displayOrder: level.displayOrder,
    };
  }

  async reorder(
    departmentId: number,
    items: { levelNumber: number; displayOrder: number }[],
  ): Promise<any> {
    const dept = await this.deptRepo.findOne({
      where: { id: departmentId, deletedAt: null },
    });
    if (!dept) throw new NotFoundException('Department not found');

    const allLevels = await this.levelRepo.find({
      where: { departmentId, isActive: true },
    });

    const knownNumbers = new Set(allLevels.map((l) => l.levelNumber));
    for (const item of items) {
      if (!knownNumbers.has(item.levelNumber)) {
        throw new BadRequestException(
          `Level ${item.levelNumber} not found in department`,
        );
      }
    }

    const oldOrder = allLevels.map((l) => ({
      levelNumber: l.levelNumber,
      displayOrder: l.displayOrder,
      roleName: l.roleName,
    }));

    for (const item of items) {
      const level = allLevels.find((l) => l.levelNumber === item.levelNumber);
      if (level) {
        level.displayOrder = item.displayOrder;
      }
    }
    await this.levelRepo.save(allLevels);

    try {
      await this.auditService.createLog({
        entityName: 'HierarchyLevel',
        entityId: `dept-${departmentId}-reorder`,
        action: 'LEVELS_REORDERED',
        oldValue: { departmentId, levels: oldOrder },
        newValue: {
          departmentId,
          levels: allLevels.map((l) => ({
            levelNumber: l.levelNumber,
            displayOrder: l.displayOrder,
            roleName: l.roleName,
          })),
        },
      });
    } catch (auditErr) {
      this.logger.warn(`Audit log failed: ${(auditErr as Error).message}`);
    }

    return {
      message: 'Hierarchy levels reordered',
      levels: allLevels
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((l) => ({
          id: l.id,
          levelNumber: l.levelNumber,
          roleName: l.roleName,
          displayOrder: l.displayOrder,
        })),
    };
  }

  // ── Private Helpers ──

  private async validateLevelDeletable(
    departmentId: number,
    levelNumber: number,
    allLevels: DepartmentHierarchyLevel[],
    roleId: number,
  ): Promise<{ deletable: boolean; reason: string | null }> {
    // Rule 1: Last remaining level
    const activeLevels = allLevels.filter((l) => l.isActive);
    if (activeLevels.length <= 1) {
      return {
        deletable: false,
        reason: 'Cannot delete the last remaining hierarchy level',
      };
    }

    // Rule 2: System roles
    const role = await this.roleRepo.findOne({
      where: { id: roleId, deletedAt: null },
    });
    if (role?.isSystemRole) {
      return {
        deletable: false,
        reason: `Role "${role.name}" is a system role and cannot be removed`,
      };
    }

    // Rule 3: Active approval workflows reference this role
    const activeApprovals = await this.approvalStepRepo.count({
      where: { roleId, deletedAt: null },
    });
    if (activeApprovals > 0) {
      return {
        deletable: false,
        reason: `${activeApprovals} active approval workflow(s) reference this level. Resolve them first.`,
      };
    }

    // Rule 4: Department admin is assigned at this level
    const dept = await this.deptRepo.findOne({ where: { id: departmentId } });
    if (dept?.departmentAdminId) {
      const adminRole = await this.userRoleRepo.findOne({
        where: {
          userId: dept.departmentAdminId,
          roleId,
        },
      });
      if (adminRole) {
        return {
          deletable: false,
          reason:
            'Department administrator is assigned at this level. Reassign the admin first.',
        };
      }
    }

    return { deletable: true, reason: null };
  }

  private findAutoMergeCandidate(
    allLevels: DepartmentHierarchyLevel[],
    sourceLevelNumber: number,
  ): {
    candidate: { id: number; levelNumber: number; roleName: string } | null;
    direction: 'up' | 'down' | null;
  } {
    const sorted = [...allLevels]
      .filter((l) => l.levelNumber !== sourceLevelNumber)
      .sort((a, b) => a.levelNumber - b.levelNumber);

    // Rule: prefer next higher level (N+1), then next lower (N-1)
    const higher = sorted.find((l) => l.levelNumber > sourceLevelNumber);
    if (higher) {
      return {
        candidate: {
          id: higher.id,
          levelNumber: higher.levelNumber,
          roleName: higher.roleName,
        },
        direction: 'up',
      };
    }

    const lower = sorted
      .reverse()
      .find((l) => l.levelNumber < sourceLevelNumber);
    if (lower) {
      return {
        candidate: {
          id: lower.id,
          levelNumber: lower.levelNumber,
          roleName: lower.roleName,
        },
        direction: 'down',
      };
    }

    return { candidate: null, direction: null };
  }
}
