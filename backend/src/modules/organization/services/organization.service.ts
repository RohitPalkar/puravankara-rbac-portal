import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, ILike, FindOptionsWhere } from 'typeorm';
import { Department } from '../entities/department.entity';
import { DepartmentRole } from '../entities/department-role.entity';
import { DepartmentHierarchyLevel } from '../entities/department-hierarchy-level.entity';
import { DepartmentZoneMapping } from '../entities/department-zone-mapping.entity';
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
    @InjectRepository(DepartmentZoneMapping)
    private readonly zoneMappingRepo: Repository<DepartmentZoneMapping>,
    private readonly dependencyValidator: DependencyValidatorService,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(query: any): Promise<any> {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      ...filters
    } = query;

    const where: FindOptionsWhere<Department> = { deletedAt: null };

    if (search) {
      where.name = ILike(`%${search}%`);
    }

    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== '' && value !== null) {
        (where as any)[key] = value;
      }
    }

    const [data, total] = await this.repository.findAndCount({
      where,
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

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
    });
    if (!dept) {
      throw new NotFoundException('Department not found');
    }
    return this.enhanceDepartmentDetail(dept);
  }

  async create(dto: CreateDepartmentDto): Promise<any> {
    const existing = await this.repository.findOne({
      where: { name: dto.name },
      withDeleted: true,
    });
    if (existing) {
      throw new ConflictException('Department with this name already exists');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const dept = queryRunner.manager.create(Department, {
        name: dto.name,
        maxHierarchyLevels: dto.numberOfLevels,
        departmentAdminId: dto.departmentAdminId ?? null,
        isActive: dto.isActive ?? true,
      });
      const savedDept = await queryRunner.manager.save(Department, dept);

      if (dto.zoneIds && dto.zoneIds.length > 0) {
        const mappings = dto.zoneIds.map((zoneId) =>
          queryRunner.manager.create(DepartmentZoneMapping, {
            departmentId: savedDept.id,
            zoneId,
          }),
        );
        await queryRunner.manager.save(DepartmentZoneMapping, mappings);
      }

      if (dto.hierarchyLevels && dto.hierarchyLevels.length > 0) {
        if (dto.hierarchyLevels.length !== dto.numberOfLevels) {
          throw new BadRequestException(
            'Number of hierarchy levels must match numberOfLevels',
          );
        }
        const levels = dto.hierarchyLevels.map((hl) =>
          queryRunner.manager.create(DepartmentHierarchyLevel, {
            departmentId: savedDept.id,
            levelNumber: hl.levelNumber,
            roleName: hl.roleName,
            displayOrder: hl.displayOrder,
          }),
        );
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
        const existing = await this.repository.findOne({
          where: { name: dto.name },
          withDeleted: true,
        });
        if (existing && existing.id !== id) {
          throw new ConflictException(
            'Department with this name already exists',
          );
        }
        updateData.name = dto.name;
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

      if (dto.zoneIds !== undefined) {
        await queryRunner.manager.delete(DepartmentZoneMapping, {
          departmentId: id,
        });
        if (dto.zoneIds.length > 0) {
          const mappings = dto.zoneIds.map((zoneId) =>
            queryRunner.manager.create(DepartmentZoneMapping, {
              departmentId: id,
              zoneId,
            }),
          );
          await queryRunner.manager.save(DepartmentZoneMapping, mappings);
        }
      }

      if (dto.hierarchyLevels !== undefined) {
        await queryRunner.manager.delete(DepartmentHierarchyLevel, {
          departmentId: id,
        });
        if (dto.hierarchyLevels.length > 0) {
          const levels = dto.hierarchyLevels.map((hl) =>
            queryRunner.manager.create(DepartmentHierarchyLevel, {
              departmentId: id,
              levelNumber: hl.levelNumber,
              roleName: hl.roleName,
              displayOrder: hl.displayOrder,
            }),
          );
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
      roleName: hl.roleName,
      displayOrder: hl.displayOrder,
    }));
  }

  async remove(id: number): Promise<void> {
    await this.dependencyValidator.assertDepartmentDeletable(id);
    const dept = await this.repository.findOne({
      where: { id, deletedAt: null },
    });
    if (!dept) {
      throw new NotFoundException('Department not found');
    }
    (dept as any).deletedAt = new Date();
    await this.repository.save(dept);
  }

  private async enhanceDepartment(dept: Department): Promise<any> {
    const [hierarchyCount, zoneMappings] = await Promise.all([
      this.hierarchyRepo.count({ where: { departmentId: dept.id } }),
      this.zoneMappingRepo.find({
        where: { departmentId: dept.id },
        relations: { zone: true },
      }),
    ]);

    const zones = zoneMappings.map((zm) => zm.zone?.name).filter(Boolean);
    const levels = hierarchyCount || dept.maxHierarchyLevels;

    return {
      id: dept.id,
      name: dept.name,
      levels,
      maxHierarchyLevels: dept.maxHierarchyLevels,
      zones,
      departmentAdminId: dept.departmentAdminId,
      isActive: dept.isActive,
      createdAt: dept.createdAt,
      updatedAt: dept.updatedAt,
    };
  }

  private async enhanceDepartmentDetail(dept: Department): Promise<any> {
    const [hierarchyLevels, zoneMappings] = await Promise.all([
      this.hierarchyRepo.find({
        where: { departmentId: dept.id },
        order: { displayOrder: 'ASC' },
      }),
      this.zoneMappingRepo.find({
        where: { departmentId: dept.id },
        relations: { zone: true },
      }),
    ]);

    const zones = zoneMappings.map((zm) => ({
      zoneId: zm.zoneId,
      zoneName: zm.zone?.name ?? `Zone #${zm.zoneId}`,
    }));

    return {
      id: dept.id,
      name: dept.name,
      maxHierarchyLevels: dept.maxHierarchyLevels,
      isActive: dept.isActive,
      departmentAdminId: dept.departmentAdminId,
      zones,
      hierarchyLevels: hierarchyLevels.map((hl) => ({
        id: hl.id,
        levelNumber: hl.levelNumber,
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

    const deptRoles = await this.deptRoleRepo.find({ relations: { department: true } });
    const roleDeptMap = new Map<number, any>();
    deptRoles.forEach((dr) => {
      roleDeptMap.set(dr.roleId, dr.department);
    });

    const countRows: { role_id: number; module_count: string; permission_count: string }[] =
      await this.repository.manager.query(
        `SELECT
           ra.role_id,
           COUNT(DISTINCT ra.module_id) as module_count,
           COUNT(ra.id) as permission_count
         FROM role_action_permissions ra
         GROUP BY ra.role_id`,
      );
    const countMap = new Map<number, { modules: number; permissions: number }>();
    countRows.forEach((r) =>
      countMap.set(Number(r.role_id), {
        modules: Number(r.module_count),
        permissions: Number(r.permission_count),
      }),
    );

    return roles.map((role) => {
      const dept = roleDeptMap.get(role.id);
      const counts = countMap.get(role.id) ?? { modules: 0, permissions: 0 };
      return {
        id: role.id,
        name: role.name,
        hierarchyLevelRank: role.hierarchyLevelRank,
        departmentId: dept?.id ?? null,
        departmentName: dept?.name ?? null,
        isActive: role.isActive,
        isSystemRole: role.isSystemRole,
        moduleCount: counts.modules,
        permissionCount: counts.permissions,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      };
    });
  }

  async findAll(query: any, searchableFields: string[] = ['name']): Promise<any> {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      departmentId,
      hierarchyLevelRank,
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
