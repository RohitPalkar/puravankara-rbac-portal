import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, ILike, FindOptionsWhere } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Zone } from '../../geography/entities/zone.entity';
import { Department } from '../entities/department.entity';
import { DepartmentRole } from '../entities/department-role.entity';
import { DepartmentHierarchyLevel } from '../entities/department-hierarchy-level.entity';
import { Role } from '../entities/role.entity';
import { BaseService } from '../../../common/crud/base.service';
import { DependencyValidatorService } from '../../../common/services/dependency-validator.service';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
  CreateRoleDto,
  UpdateRoleDto,
} from '../dto/organization.dto';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    readonly repository: Repository<Department>,
    @InjectRepository(DepartmentHierarchyLevel)
    private readonly hierarchyRepo: Repository<DepartmentHierarchyLevel>,
    @InjectRepository(DepartmentRole)
    private readonly deptRoleRepo: Repository<DepartmentRole>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    private readonly dependencyValidator: DependencyValidatorService,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(query: any): Promise<any> {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy = 'zoneName',
      sortOrder = 'ASC',
      ...filters
    } = query;

    const qb = this.repository.createQueryBuilder('dept')
      .leftJoinAndSelect('dept.zone', 'zone')
      .where('dept.deletedAt IS NULL');

    if (search) {
      qb.andWhere(
        '(dept.name ILike :search OR zone.name ILike :search)',
        { search: `%${search}%` },
      );
    }

    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== '' && value !== null) {
        if (key === 'zoneId') {
          qb.andWhere('dept.zoneId = :zoneId', { zoneId: Number(value) });
        } else if (key === 'isActive') {
          qb.andWhere('dept.isActive = :isActive', { isActive: value === 'true' || value === true });
        }
      }
    }

    const sortMap: Record<string, string> = {
      zoneName: 'zone.name',
      name: 'dept.name',
      status: 'dept.isActive',
      createdAt: 'dept.createdAt',
    };

    const orderField = sortMap[sortBy] || 'zone.name';
    const dir = sortOrder === 'DESC' ? 'DESC' : 'ASC';
    qb.orderBy(orderField, dir);
    if (sortBy === 'zoneName') {
      qb.addOrderBy('dept.name', 'ASC');
    }

    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    const enhanced = await Promise.all(
      data.map((dept) => this.enhanceDepartment(dept)),
    );

    return {
      data: enhanced,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: number): Promise<any> {
    const dept = await this.repository.findOne({
      where: { id, deletedAt: null },
      relations: { zone: true },
    });
    if (!dept) {
      throw new NotFoundException('Department not found');
    }
    return this.enhanceDepartmentDetail(dept);
  }

  async create(dto: CreateDepartmentDto): Promise<any> {
    const existing = await this.repository.findOne({
      where: { name: dto.name, zoneId: dto.zoneId },
      withDeleted: true,
    });
    if (existing) {
      throw new ConflictException(
        `Department "${dto.name}" already exists in this zone`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const dept = queryRunner.manager.create(Department, {
        name: dto.name,
        zoneId: dto.zoneId,
        maxHierarchyLevels: dto.numberOfLevels,
        departmentAdminId: dto.departmentAdminId ?? null,
        isActive: dto.isActive ?? true,
      });
      const savedDept = await queryRunner.manager.save(Department, dept);

      if (dto.hierarchyLevels && dto.hierarchyLevels.length > 0) {
        if (dto.hierarchyLevels.length !== dto.numberOfLevels) {
          throw new BadRequestException(
            'Number of hierarchy levels must match numberOfLevels',
          );
        }

        // Create/find roles first, then save levels with roleId
        const roleNameToLevel = new Map<string, number>();
        for (const hl of dto.hierarchyLevels) {
          if (hl.roleName && !roleNameToLevel.has(hl.roleName)) {
            roleNameToLevel.set(hl.roleName, hl.levelNumber);
          }
        }

        const roleNameToRole = new Map<string, Role>();
        for (const [roleName, levelNumber] of roleNameToLevel) {
          let role = await queryRunner.manager.findOne(Role, {
            where: { name: roleName, deletedAt: null },
          });
          if (!role) {
            role = queryRunner.manager.create(Role, {
              name: roleName,
              hierarchyLevelRank: levelNumber,
              isActive: true,
            });
            role = await queryRunner.manager.save(Role, role);
          }
          roleNameToRole.set(roleName, role);
          await queryRunner.manager.save(DepartmentRole, {
            departmentId: savedDept.id,
            roleId: role.id,
          });
        }

        const levels = dto.hierarchyLevels.map((hl) => {
          const role = roleNameToRole.get(hl.roleName);
          return queryRunner.manager.create(DepartmentHierarchyLevel, {
            departmentId: savedDept.id,
            roleId: role.id,
            levelNumber: hl.levelNumber,
            roleName: hl.roleName,
            displayOrder: hl.displayOrder,
          });
        });
        await queryRunner.manager.save(DepartmentHierarchyLevel, levels);
      }

      await queryRunner.commitTransaction();
      return this.findById(savedDept.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: number, dto: UpdateDepartmentDto): Promise<any> {
    await this.findById(id);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const updateData: Partial<Department> = {};
      if (dto.name !== undefined) {
        const zoneCheck = dto.zoneId ?? (
          await this.repository.findOne({ where: { id }, withDeleted: true })
        )?.zoneId;
        const existing = await this.repository.findOne({
          where: { name: dto.name, zoneId: zoneCheck },
          withDeleted: true,
        });
        if (existing && existing.id !== id) {
          throw new ConflictException(
            `Department "${dto.name}" already exists in this zone`,
          );
        }
        updateData.name = dto.name;
      }
      if (dto.zoneId !== undefined) {
        if (dto.name !== undefined) {
          const existing = await this.repository.findOne({
            where: { name: dto.name, zoneId: dto.zoneId },
            withDeleted: true,
          });
          if (existing && existing.id !== id) {
            throw new ConflictException(
              `Department "${dto.name}" already exists in this zone`,
            );
          }
        }
        updateData.zoneId = dto.zoneId;
      }
      if (dto.numberOfLevels !== undefined) {
        updateData.maxHierarchyLevels = dto.numberOfLevels;
      }
      if (dto.departmentAdminId !== undefined) {
        updateData.departmentAdminId = dto.departmentAdminId;
      }
      if (dto.isActive !== undefined) {
        updateData.isActive = dto.isActive;
      }

      if (Object.keys(updateData).length > 0) {
        await queryRunner.manager.update(Department, id, updateData);
      }

      if (dto.hierarchyLevels !== undefined) {
        await queryRunner.manager.delete(DepartmentHierarchyLevel, {
          departmentId: id,
        });
        await queryRunner.manager.delete(DepartmentRole, {
          departmentId: id,
        });
        if (dto.hierarchyLevels.length > 0) {
          // Create/find roles first, then save levels with roleId
          const roleNameToLevel = new Map<string, number>();
          for (const hl of dto.hierarchyLevels) {
            if (hl.roleName && !roleNameToLevel.has(hl.roleName)) {
              roleNameToLevel.set(hl.roleName, hl.levelNumber);
            }
          }

          const roleNameToRole = new Map<string, Role>();
          for (const [roleName, levelNumber] of roleNameToLevel) {
            let role = await queryRunner.manager.findOne(Role, {
              where: { name: roleName, deletedAt: null },
            });
            if (!role) {
              role = queryRunner.manager.create(Role, {
                name: roleName,
                hierarchyLevelRank: levelNumber,
                isActive: true,
              });
              role = await queryRunner.manager.save(Role, role);
            }
            roleNameToRole.set(roleName, role);
            await queryRunner.manager.save(DepartmentRole, {
              departmentId: id,
              roleId: role.id,
            });
          }

          const levels = dto.hierarchyLevels.map((hl) => {
            const role = roleNameToRole.get(hl.roleName);
            return queryRunner.manager.create(DepartmentHierarchyLevel, {
              departmentId: id,
              roleId: role.id,
              levelNumber: hl.levelNumber,
              roleName: hl.roleName,
              displayOrder: hl.displayOrder,
            });
          });
          await queryRunner.manager.save(DepartmentHierarchyLevel, levels);
        }
      }

      await queryRunner.commitTransaction();
      return this.findById(id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getStats(): Promise<any> {
    const all = await this.repository.find({ where: { deletedAt: null } });
    const active = all.filter((d) => d.isActive).length;
    const inactive = all.filter((d) => !d.isActive).length;
    const zoneSet = new Set(all.map((d) => d.zoneId));
    return {
      total: all.length,
      active,
      inactive,
      zonesCovered: zoneSet.size,
    };
  }

  async getDeleteImpact(id: number): Promise<any> {
    const dept = await this.repository.findOne({
      where: { id, deletedAt: null },
      relations: { zone: true },
    });
    if (!dept) throw new NotFoundException('Department not found');

    const [
      userCount,
      deptRoleCount,
      hlCount,
      approvalCount,
      reportingCount,
    ] = await Promise.all([
      this.repository.manager.count(User, {
        where: { departmentId: id, deletedAt: null },
      }),
      this.deptRoleRepo.count({ where: { departmentId: id } }),
      this.hierarchyRepo.count({ where: { departmentId: id } }),
      this.repository.manager.count('approval_steps' as any, {
        where: { department_id: id, deletedAt: null },
      } as any).catch(() => 0),
      this.repository.manager.count('user_reporting_lines' as any, {
        where: { level_rank: 0 },
      } as any).catch(() => 0),
    ]);

    return {
      departmentId: id,
      departmentName: dept.name,
      zoneId: dept.zoneId,
      zoneName: dept.zone?.name ?? `Zone #${dept.zoneId}`,
      dependencies: {
        users: userCount,
        roles: deptRoleCount,
        hierarchyLevels: hlCount,
        approvals: approvalCount,
        reportingLines: reportingCount,
      },
      hasDependencies:
        userCount > 0 || deptRoleCount > 0 || hlCount > 0 || approvalCount > 0,
    };
  }

  async removeWithMerge(
    id: number,
    targetDepartmentId: number,
  ): Promise<any> {
    const dept = await this.repository.findOne({
      where: { id, deletedAt: null },
      relations: { zone: true },
    });
    if (!dept) throw new NotFoundException('Source department not found');

    const target = await this.repository.findOne({
      where: { id: targetDepartmentId, deletedAt: null },
    });
    if (!target) throw new NotFoundException('Target department not found');

    if (dept.zoneId !== target.zoneId) {
      throw new BadRequestException(
        'Cannot merge departments across different zones',
      );
    }
    if (id === targetDepartmentId) {
      throw new BadRequestException('Cannot merge a department into itself');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Move users
      await queryRunner.manager.update(
        User,
        { departmentId: id },
        { departmentId: targetDepartmentId },
      );

      // Move department roles
      const existingRoles = await queryRunner.manager.find(DepartmentRole, {
        where: { departmentId: targetDepartmentId },
      });
      const existingRoleIds = new Set(existingRoles.map((r) => r.roleId));
      const sourceRoles = await queryRunner.manager.find(DepartmentRole, {
        where: { departmentId: id },
      });
      for (const dr of sourceRoles) {
        if (!existingRoleIds.has(dr.roleId)) {
          await queryRunner.manager.save(
            queryRunner.manager.create(DepartmentRole, {
              departmentId: targetDepartmentId,
              roleId: dr.roleId,
            }),
          );
        }
      }
      await queryRunner.manager.delete(DepartmentRole, { departmentId: id });

      // Move hierarchy levels
      const levels = await queryRunner.manager.find(DepartmentHierarchyLevel, {
        where: { departmentId: id },
      });
      for (const hl of levels) {
        await queryRunner.manager.save(
          queryRunner.manager.create(DepartmentHierarchyLevel, {
            departmentId: targetDepartmentId,
            roleId: hl.roleId,
            levelNumber: hl.levelNumber,
            roleName: hl.roleName,
            displayOrder: hl.displayOrder,
            isActive: hl.isActive,
          }),
        );
      }
      await queryRunner.manager.delete(DepartmentHierarchyLevel, {
        departmentId: id,
      });

      // Soft-delete source department
      await queryRunner.manager.update(
        Department,
        id,
        { deletedAt: new Date() } as any,
      );

      await queryRunner.commitTransaction();
      return {
        message: `Merged "${dept.name}" into "${target.name}"`,
        sourceDepartmentId: id,
        targetDepartmentId,
        usersMoved: existingRoles.length,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async checkName(
    name: string,
    zoneId: number,
    excludeId?: number,
  ): Promise<any> {
    const existing = await this.repository.findOne({
      where: { name, zoneId },
      withDeleted: true,
    });
    if (!existing) {
      return { available: true };
    }
    if (excludeId && existing.id === excludeId) {
      return { available: true };
    }

    // Find other zones where this name exists
    const otherZones = await this.repository.find({
      where: { name },
      relations: { zone: true },
    });
    const existingInZones = otherZones
      .filter((d) => d.zoneId !== zoneId)
      .map((d) => ({
        zoneId: d.zoneId,
        zoneName: d.zone?.name ?? `Zone #${d.zoneId}`,
      }));

    return {
      available: false,
      existingInZones,
      message: `"${name}" already exists in ${
        existing.zone?.name ?? `Zone #${existing.zoneId}`
      }. Choose another name or a different zone.`,
    };
  }

  async getHierarchyLevels(departmentId: number): Promise<any[]> {
    const dept = await this.repository.findOne({
      where: { id: departmentId, deletedAt: null },
    });
    if (!dept) {
      throw new NotFoundException('Department not found');
    }

    const levels = await this.hierarchyRepo.find({
      where: { departmentId, isActive: true },
      order: { levelNumber: 'ASC' },
    });

    return levels.map((hl) => ({
      id: hl.id,
      levelNumber: hl.levelNumber,
      roleId: hl.roleId,
      roleName: hl.roleName,
      displayOrder: hl.displayOrder,
    }));
  }

  async getRoleForHierarchyLevel(
    departmentId: number,
    levelNumber: number,
  ): Promise<any> {
    const dept = await this.repository.findOne({
      where: { id: departmentId, deletedAt: null },
    });
    if (!dept) {
      throw new NotFoundException('Department not found');
    }

    const hierarchyLevel = await this.hierarchyRepo.findOne({
      where: { departmentId, levelNumber, isActive: true },
    });
    if (!hierarchyLevel) {
      throw new NotFoundException('Hierarchy level not found');
    }

    const role = await this.repository.manager
      .createQueryBuilder()
      .select('r.id', 'roleId')
      .addSelect('r.name', 'roleName')
      .from(Role, 'r')
      .innerJoin(
        'department_roles',
        'dr',
        'dr.role_id = r.id AND dr.department_id = :deptId',
        { deptId: departmentId },
      )
      .where('r.hierarchy_level_rank = :level', { level: levelNumber })
      .andWhere('r.deletedAt IS NULL')
      .andWhere('r.is_active = :active', { active: true })
      .getRawOne();

    if (!role) {
      return {
        roleId: null,
        roleName: null,
        hierarchyLevel: `L${levelNumber}`,
      };
    }

    return {
      hierarchyLevel: `L${levelNumber}`,
      roleName: role.roleName,
      roleId: role.roleId,
    };
  }

  async remove(id: number): Promise<void> {
    const dept = await this.repository.findOne({
      where: { id, deletedAt: null },
      relations: { zone: true },
    });
    if (!dept) {
      throw new NotFoundException('Department not found');
    }
    (dept as any).deletedAt = new Date();
    await this.repository.save(dept);
  }

  async assignDepartmentAdmin(
    id: number,
    userId: string,
  ): Promise<any> {
    const dept = await this.repository.findOne({
      where: { id, deletedAt: null },
    });
    if (!dept) {
      throw new NotFoundException('Department not found');
    }

    const user = await this.repository.manager.findOne(User, {
      where: { empId: userId, deletedAt: null },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    dept.departmentAdminId = userId;
    await this.repository.save(dept);
    return this.findById(id);
  }

  async removeDepartmentAdmin(id: number): Promise<any> {
    const dept = await this.repository.findOne({
      where: { id, deletedAt: null },
    });
    if (!dept) {
      throw new NotFoundException('Department not found');
    }

    dept.departmentAdminId = null;
    await this.repository.save(dept);
    return this.findById(id);
  }

  private async enhanceDepartment(dept: Department): Promise<any> {
    const hierarchyCount = await this.hierarchyRepo.count({
      where: { departmentId: dept.id },
    });
    const levels = hierarchyCount || dept.maxHierarchyLevels;

    let zoneName: string | null = null;
    if (dept.zone) {
      zoneName = dept.zone.name;
    } else if (dept.zoneId) {
      const zone = await this.repository.manager.findOne(Zone, {
        where: { id: dept.zoneId },
      });
      zoneName = zone?.name ?? null;
    }

    const [userCount, roleCount] = await Promise.all([
      this.repository.manager.count(User, {
        where: { departmentId: dept.id, deletedAt: null },
      }),
      this.deptRoleRepo.count({
        where: { departmentId: dept.id },
      }),
    ]);

    return {
      id: dept.id,
      name: dept.name,
      levels,
      maxHierarchyLevels: dept.maxHierarchyLevels,
      zoneId: dept.zoneId,
      zoneName,
      departmentAdminId: dept.departmentAdminId,
      isActive: dept.isActive,
      createdAt: dept.createdAt,
      updatedAt: dept.updatedAt,
      userCount,
      roleCount,
    };
  }

  private async enhanceDepartmentDetail(dept: Department): Promise<any> {
    const hierarchyLevels = await this.hierarchyRepo.find({
      where: { departmentId: dept.id },
      order: { displayOrder: 'ASC' },
    });

    let zoneName: string | null = null;
    if (dept.zone) {
      zoneName = dept.zone.name;
    } else if (dept.zoneId) {
      const zone = await this.repository.manager.findOne(Zone, {
        where: { id: dept.zoneId },
      });
      zoneName = zone?.name ?? null;
    }

    return {
      id: dept.id,
      name: dept.name,
      maxHierarchyLevels: dept.maxHierarchyLevels,
      isActive: dept.isActive,
      departmentAdminId: dept.departmentAdminId,
      zoneId: dept.zoneId,
      zoneName,
      hierarchyLevels: hierarchyLevels.map((hl) => ({
        id: hl.id,
        levelNumber: hl.levelNumber,
        roleId: hl.roleId,
        roleName: hl.roleName,
        displayOrder: hl.displayOrder,
      })),
      createdAt: dept.createdAt,
      updatedAt: dept.updatedAt,
    };
  }
}

@Injectable()
export class RoleService extends BaseService<Role> {
  constructor(
    @InjectRepository(Role)
    readonly repository: Repository<Role>,
    @InjectRepository(Department)
    private readonly deptRepo: Repository<Department>,
    @InjectRepository(DepartmentRole)
    private readonly deptRoleRepo: Repository<DepartmentRole>,
    @InjectRepository(DepartmentHierarchyLevel)
    private readonly hierarchyLevelRepo: Repository<DepartmentHierarchyLevel>,
    private readonly dependencyValidator: DependencyValidatorService,
  ) {
    super(repository);
  }

  async getPermissionsSummary(): Promise<any[]> {
    const roles = await this.repository.find({
      where: { deletedAt: null },
      order: { name: 'ASC' },
    });

    const deptRoles = await this.deptRoleRepo.find({
      relations: { department: true },
    });
    const roleDeptMap = new Map<number, any>();
    deptRoles.forEach((dr) => {
      roleDeptMap.set(dr.roleId, dr.department);
    });

    const countRows: {
      role_id: number;
      module_count: string;
      permission_count: string;
    }[] = await this.repository.manager.query(
      `SELECT
           ra.role_id,
           COUNT(DISTINCT ra.module_id) as module_count,
           COUNT(ra.id) as permission_count
         FROM role_action_permissions ra
         GROUP BY ra.role_id`,
    );
    const countMap = new Map<
      number,
      { modules: number; permissions: number }
    >();
    countRows.forEach((r) =>
      countMap.set(Number(r.role_id), {
        modules: Number(r.module_count),
        permissions: Number(r.permission_count),
      }),
    );

    return roles
      .map((role) => {
        const dept = roleDeptMap.get(role.id);
        const counts = countMap.get(role.id) ?? { modules: 0, permissions: 0 };
        return {
          id: role.id,
          name: role.name,
          hierarchyLevelRank: role.hierarchyLevelRank,
          departmentId: dept?.id ?? null,
          departmentName: dept?.name ?? null,
          zoneId: dept?.zoneId ?? null,
          isActive: role.isActive,
          isSystemRole: role.isSystemRole,
          moduleCount: counts.modules,
          permissionCount: counts.permissions,
          createdAt: role.createdAt,
          updatedAt: role.updatedAt,
        };
      })
      .filter((r) => r.permissionCount > 0);
  }

  async findAll(
    query: any,
    searchableFields: string[] = ['name'],
  ): Promise<any> {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      departmentId,
      hierarchyLevelRank,
      zoneId,
      roleId,
      ...filters
    } = query;

    const qb = this.repository
      .createQueryBuilder('role')
      .where('role.deletedAt IS NULL');

    if (search) {
      qb.andWhere('role.name ILIKE :search', { search: `%${search}%` });
    }

    if (departmentId) {
      qb.innerJoin(
        'department_roles',
        'dr',
        'dr.role_id = role.id AND dr.department_id = :deptId',
        { deptId: Number(departmentId) },
      );
    }

    // Roles are global; zone filtering goes through the departments a role
    // is attached to (roles table has no direct zone column)
    if (zoneId != null && zoneId !== '') {
      qb.innerJoin(
        'department_roles',
        'dr_zone',
        'dr_zone.role_id = role.id',
      )
        .innerJoin(
          'departments',
          'zone_dept',
          'zone_dept.id = dr_zone.department_id AND zone_dept.zone_id = :zoneId',
          { zoneId: Number(zoneId) },
        )
        .distinct(true);
    }

    if (roleId != null && roleId !== '') {
      qb.andWhere('role.id = :roleId', { roleId: Number(roleId) });
    }

    if (hierarchyLevelRank) {
      qb.andWhere('role.hierarchy_level_rank = :level', {
        level: Number(hierarchyLevelRank),
      });
    }

    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== '' && value !== null) {
        qb.andWhere(`role.${key} = :${key}`, { [key]: value });
      }
    }

    qb.orderBy(`role.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async create(dto: CreateRoleDto): Promise<Role> {
    const defaultMaxLevels = 4;
    if (dto.hierarchyLevelRank > defaultMaxLevels) {
      throw new BadRequestException(
        `Role level ${dto.hierarchyLevelRank} exceeds maximum allowed hierarchy level (${defaultMaxLevels})`,
      );
    }
    return super.create(dto);
  }

  async update(id: number, dto: UpdateRoleDto): Promise<Role> {
    if (dto.hierarchyLevelRank != null) {
      const defaultMaxLevels = 4;
      if (dto.hierarchyLevelRank > defaultMaxLevels) {
        throw new BadRequestException(
          `Role level ${dto.hierarchyLevelRank} exceeds maximum allowed hierarchy level (${defaultMaxLevels})`,
        );
      }
    }
    return super.update(id, dto);
  }

  async remove(id: number): Promise<void> {
    await this.dependencyValidator.assertRoleDeletable(id);
    return super.remove(id);
  }
}
