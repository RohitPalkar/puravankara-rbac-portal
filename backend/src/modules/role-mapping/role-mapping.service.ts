import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Role } from '../organization/entities/role.entity';
import { DepartmentRole } from '../organization/entities/department-role.entity';
import { Department } from '../organization/entities/department.entity';
import { PermissionTemplate } from '../permissions/entities/permission-template.entity';
import { TemplatePermission } from '../permissions/entities/template-permission.entity';
import { Module as ProductModule } from '../product-catalog/entities/module.entity';
import { SubModule } from '../product-catalog/entities/sub-module.entity';
import { Action } from '../product-catalog/entities/action.entity';
import { CreateRoleMappingDto, UpdateRoleMappingDto } from './role-mapping.dto';
import {
  RoleMappingListItem,
  RoleMappingDetailResponse,
  RoleMappingDetailModule,
} from './role-mapping.dto';

@Injectable()
export class RoleMappingService {
  private readonly logger = new Logger(RoleMappingService.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(DepartmentRole)
    private readonly deptRoleRepo: Repository<DepartmentRole>,
    @InjectRepository(Department)
    private readonly deptRepo: Repository<Department>,
    @InjectRepository(PermissionTemplate)
    private readonly templateRepo: Repository<PermissionTemplate>,
    @InjectRepository(TemplatePermission)
    private readonly tpRepo: Repository<TemplatePermission>,
    @InjectRepository(ProductModule)
    private readonly moduleRepo: Repository<ProductModule>,
    @InjectRepository(SubModule)
    private readonly subModuleRepo: Repository<SubModule>,
    @InjectRepository(Action)
    private readonly actionRepo: Repository<Action>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateRoleMappingDto) {
    const existingRole = await this.roleRepo.findOne({
      where: { name: dto.name },
    });
    if (existingRole) {
      throw new ConflictException(`Role "${dto.name}" already exists`);
    }

    const dept = await this.deptRepo.findOne({ where: { id: dto.departmentId } });
    if (!dept) {
      throw new NotFoundException(`Department ${dto.departmentId} not found`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const role = queryRunner.manager.create(Role, {
        name: dto.name,
        hierarchyLevelRank: dto.hierarchyLevelRank,
        isActive: true,
        isSystemRole: false,
      });
      const savedRole = await queryRunner.manager.save(role);

      const deptRole = queryRunner.manager.create(DepartmentRole, {
        departmentId: dto.departmentId,
        roleId: savedRole.id,
      });
      await queryRunner.manager.save(deptRole);

      const template = queryRunner.manager.create(PermissionTemplate, {
        name: `Template: ${dto.name}`,
        description: `Auto-generated template for role "${dto.name}"`,
        isActive: true,
      });
      const savedTemplate = await queryRunner.manager.save(template);

      const tpEntries: TemplatePermission[] = [];
      for (const entry of dto.permissions) {
        const { moduleId, subModuleId, actionIds } = entry;
        for (const actionId of actionIds) {
          const tp = queryRunner.manager.create(TemplatePermission, {
            templateId: savedTemplate.id,
            moduleId,
            subModuleId: subModuleId ?? null,
            actionId,
          });
          tpEntries.push(tp);
        }
      }
      if (tpEntries.length > 0) {
        await queryRunner.manager.save(tpEntries);
      }

      await queryRunner.commitTransaction();

      return {
        roleId: savedRole.id,
        name: savedRole.name,
        hierarchyLevel: savedRole.hierarchyLevelRank,
        departmentId: dto.departmentId,
        templateId: savedTemplate.id,
        permissionCount: tpEntries.length,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Role mapping transaction failed: ${(err as Error).message}`);
      if (err instanceof ConflictException || err instanceof NotFoundException) {
        throw err;
      }
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: number, dto: UpdateRoleMappingDto) {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundException(`Role ${id} not found`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (dto.name) role.name = dto.name;
      if (dto.hierarchyLevelRank != null) role.hierarchyLevelRank = dto.hierarchyLevelRank;
      await queryRunner.manager.save(role);

      if (dto.departmentId != null) {
        await queryRunner.manager.delete(DepartmentRole, { roleId: id });
        const dept = await queryRunner.manager.findOne(Department, {
          where: { id: dto.departmentId },
        });
        if (!dept) throw new NotFoundException(`Department ${dto.departmentId} not found`);
        await queryRunner.manager.save(queryRunner.manager.create(DepartmentRole, {
          departmentId: dto.departmentId,
          roleId: id,
        }));
      }

      if (dto.permissions) {
        const template = await queryRunner.manager.findOne(PermissionTemplate, {
          where: { name: `Template: ${role.name}` },
        });
        if (template) {
          await queryRunner.manager.delete(TemplatePermission, { templateId: template.id });
          const tpEntries: TemplatePermission[] = [];
          for (const entry of dto.permissions) {
            const { moduleId, subModuleId, actionIds } = entry;
            for (const actionId of actionIds) {
              tpEntries.push(queryRunner.manager.create(TemplatePermission, {
                templateId: template.id,
                moduleId,
                subModuleId: subModuleId ?? null,
                actionId,
              }));
            }
          }
          if (tpEntries.length > 0) {
            await queryRunner.manager.save(tpEntries);
          }
        }
      }

      await queryRunner.commitTransaction();
      return { roleId: id, name: role.name };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number) {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundException(`Role ${id} not found`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const template = await queryRunner.manager.findOne(PermissionTemplate, {
        where: { name: `Template: ${role.name}` },
      });
      if (template) {
        await queryRunner.manager.delete(TemplatePermission, { templateId: template.id });
        await queryRunner.manager.delete(PermissionTemplate, template.id);
      }
      await queryRunner.manager.delete(DepartmentRole, { roleId: id });
      role.isActive = false;
      await queryRunner.manager.save(role);

      await queryRunner.commitTransaction();
      return { message: `Role "${role.name}" deleted successfully` };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<RoleMappingListItem[]> {
    const deptRoles = await this.deptRoleRepo.find({
      relations: { role: true, department: true },
      where: { role: { isActive: true } },
    });

    const templates = await this.templateRepo.find({
      where: { isActive: true },
    });

    const permissionCounts = new Map<number, number>();
    const templateModuleMap = new Map<number, Set<number>>();
    if (templates.length > 0) {
      const tps = await this.tpRepo.find({
        where: { templateId: In(templates.map((t) => t.id)) },
      });
      for (const tp of tps) {
        permissionCounts.set(
          tp.templateId,
          (permissionCounts.get(tp.templateId) || 0) + 1,
        );
        if (!templateModuleMap.has(tp.templateId)) {
          templateModuleMap.set(tp.templateId, new Set());
        }
        templateModuleMap.get(tp.templateId)!.add(tp.moduleId);
      }
    }

    return deptRoles.map((dr) => {
      const matchingTemplate = templates.find((t) =>
        t.name.includes(dr.role.name),
      );
      const tId = matchingTemplate?.id;
      const mCount = tId ? templateModuleMap.get(tId)?.size || 0 : 0;
      const pCount = tId ? permissionCounts.get(tId) || 0 : 0;

      return {
        id: dr.role.id,
        name: dr.role.name,
        hierarchyLevel: dr.role.hierarchyLevelRank,
        departmentName: dr.department?.name || 'N/A',
        moduleCount: mCount,
        permissionCount: pCount,
        status: dr.role.isActive ? 'ACTIVE' : 'INACTIVE',
      };
    });
  }

  async findById(id: number): Promise<RoleMappingDetailResponse> {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundException(`Role ${id} not found`);

    const deptRole = await this.deptRoleRepo.findOne({
      where: { roleId: id },
      relations: { department: true },
    });
    if (!deptRole) {
      throw new NotFoundException(`Department-role mapping for role ${id} not found`);
    }

    const template = await this.templateRepo.findOne({
      where: { name: `Template: ${role.name}` },
    });

    const modules: RoleMappingDetailModule[] = [];
    if (template) {
      const tps = await this.tpRepo.find({
        where: { templateId: template.id },
      });

      const moduleIds = [...new Set(tps.map((tp) => tp.moduleId))];
      const allModules = moduleIds.length > 0
        ? await this.moduleRepo.find({ where: { id: In(moduleIds) } })
        : [];
      const allSubModules = await this.subModuleRepo.find();
      const allActions = await this.actionRepo.find();

      const moduleMap = new Map(allModules.map((m) => [m.id, m]));
      const subModuleMap = new Map(allSubModules.map((sm) => [sm.id, sm]));
      const actionMap = new Map(allActions.map((a) => [a.id, a]));

      for (const modId of moduleIds) {
        const mod = moduleMap.get(modId);
        if (!mod) continue;

        const modTps = tps.filter((tp) => tp.moduleId === modId);
        const directTps = modTps.filter((tp) => !tp.subModuleId);
        const subModuleTps = modTps.filter((tp) => tp.subModuleId);

        const directActions = directTps
          .map((tp) => actionMap.get(tp.actionId))
          .filter(Boolean)
          .map((a) => ({
            id: a!.id,
            code: a!.code,
            label: a!.label,
          }));

        const subModuleIds = [...new Set(subModuleTps.map((tp) => tp.subModuleId!))];
        const subModules = subModuleIds.map((smId) => {
          const sm = subModuleMap.get(smId);
          const smActions = subModuleTps
            .filter((tp) => tp.subModuleId === smId)
            .map((tp) => actionMap.get(tp.actionId))
            .filter(Boolean)
            .map((a) => ({
              id: a!.id,
              code: a!.code,
              label: a!.label,
            }));
          return {
            id: smId,
            name: sm?.name || `SubModule ${smId}`,
            actions: smActions,
          };
        });

        modules.push({
          id: modId,
          name: mod.name,
          subModules,
          actions: directActions,
        });
      }
    }

    return {
      roleId: role.id,
      name: role.name,
      hierarchyLevel: role.hierarchyLevelRank,
      departmentId: deptRole.departmentId,
      departmentName: deptRole.department?.name || 'N/A',
      modules,
      status: role.isActive ? 'ACTIVE' : 'INACTIVE',
    };
  }

  async findRolesByDepartment(departmentId: number) {
    const deptRoles = await this.deptRoleRepo.find({
      where: { departmentId },
      relations: { role: true },
    });

    return deptRoles
      .filter((dr) => dr.role.isActive)
      .map((dr) => ({
        id: dr.role.id,
        name: dr.role.name,
        hierarchyLevelRank: dr.role.hierarchyLevelRank,
      }))
      .sort((a, b) => a.hierarchyLevelRank - b.hierarchyLevelRank);
  }

  async findAvailableSecondaryRoles(primaryRoleId?: number) {
    const roles = await this.roleRepo.find({
      where: { isActive: true },
      order: { hierarchyLevelRank: 'ASC' },
    });

    return roles
      .filter((r) => r.id !== primaryRoleId)
      .map((r) => ({
        id: r.id,
        name: r.name,
        hierarchyLevelRank: r.hierarchyLevelRank,
      }))
      .sort((a, b) => a.hierarchyLevelRank - b.hierarchyLevelRank);
  }
}
