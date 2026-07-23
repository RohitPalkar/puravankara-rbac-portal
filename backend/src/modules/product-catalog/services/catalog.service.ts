import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Module as ModuleEntity } from '../entities/module.entity';
import { SubModule } from '../entities/sub-module.entity';
import { ActionGroup } from '../entities/action-group.entity';
import { Action } from '../entities/action.entity';
import { ModuleAction } from '../entities/module-action.entity';
import { BaseService } from '../../../common/crud/base.service';
import { DependencyValidatorService } from '../../../common/services/dependency-validator.service';
import {
  CreateModuleDto,
  UpdateModuleDto,
  CreateSubModuleDto,
  UpdateSubModuleDto,
  CreateActionGroupDto,
  UpdateActionGroupDto,
  CreateActionDto,
  UpdateActionDto,
  CreateModuleActionDto,
  UpdateModuleActionDto,
} from '../dto/catalog.dto';

@Injectable()
export class ModuleCatalogService extends BaseService<ModuleEntity> {
  constructor(
    @InjectRepository(ModuleEntity)
    readonly repository: Repository<ModuleEntity>,
    private readonly dependencyValidator: DependencyValidatorService,
  ) {
    super(repository);
  }

  async create(dto: CreateModuleDto): Promise<ModuleEntity> {
    return super.create(dto);
  }

  async update(id: number, dto: UpdateModuleDto): Promise<ModuleEntity> {
    return super.update(id, dto);
  }

  async remove(id: number): Promise<void> {
    await this.dependencyValidator.assertModuleDeletable(id);
    return super.remove(id);
  }

  async getTree(): Promise<any[]> {
    const modules = await this.repository
      .createQueryBuilder('m')
      .where('m.is_active = true')
      .orderBy('m.name', 'ASC')
      .getMany();

    const subModules = await this.repository.manager.query(
      `SELECT * FROM sub_modules WHERE is_active = true AND deleted_at IS NULL ORDER BY name ASC`,
    );

    const actionGroups = await this.repository.manager.query(
      `SELECT * FROM public.action_groups WHERE is_active = true AND deleted_at IS NULL ORDER BY name ASC`,
    );

    const actions = await this.repository.manager.query(
      `SELECT * FROM actions WHERE is_active = true AND deleted_at IS NULL ORDER BY name ASC`,
    );

    return modules.map((mod) => {
      const modSubModules = subModules.filter((sm) => sm.module_id === mod.id);
      return {
        id: mod.id,
        name: mod.name,
        code: mod.code,
        subModules: modSubModules.map((sm) => {
          const smActionGroups = actionGroups.filter((ag) => ag.sub_module_id === sm.id);
          return {
            id: sm.id,
            name: sm.name,
            displayOrder: sm.display_order,
            actionGroups: smActionGroups.map((ag) => ({
              id: ag.id,
              name: ag.name,
              code: ag.code,
              displayOrder: ag.display_order,
              actions: actions
                .filter((a) => a.action_group_id === ag.id)
                .map((a) => ({
                  id: a.id,
                  code: a.code,
                  name: a.name,
                  label: a.label,
                  displayOrder: a.display_order,
                })),
            })),
          };
        }),
      };
    });
  }
}

@Injectable()
export class SubModuleCatalogService extends BaseService<SubModule> {
  constructor(
    @InjectRepository(SubModule)
    readonly repository: Repository<SubModule>,
  ) {
    super(repository);
  }

  async create(dto: CreateSubModuleDto): Promise<SubModule> {
    return super.create(dto);
  }

  async update(id: number, dto: UpdateSubModuleDto): Promise<SubModule> {
    return super.update(id, dto);
  }
}

@Injectable()
export class ActionGroupCatalogService extends BaseService<ActionGroup> {
  constructor(
    @InjectRepository(ActionGroup)
    readonly repository: Repository<ActionGroup>,
  ) {
    super(repository);
  }

  async create(dto: CreateActionGroupDto): Promise<ActionGroup> {
    return super.create(dto);
  }

  async update(id: number, dto: UpdateActionGroupDto): Promise<ActionGroup> {
    return super.update(id, dto);
  }
}

@Injectable()
export class ActionCatalogService extends BaseService<Action> {
  constructor(
    @InjectRepository(Action)
    readonly repository: Repository<Action>,
  ) {
    super(repository);
  }

  async create(dto: CreateActionDto): Promise<Action> {
    return super.create(dto);
  }

  async update(id: number, dto: UpdateActionDto): Promise<Action> {
    return super.update(id, dto);
  }
}

@Injectable()
export class ModuleActionCatalogService extends BaseService<ModuleAction> {
  constructor(
    @InjectRepository(ModuleAction)
    readonly repository: Repository<ModuleAction>,
  ) {
    super(repository);
  }

  async create(dto: CreateModuleActionDto): Promise<ModuleAction> {
    return super.create(dto);
  }

  async update(id: number, dto: UpdateModuleActionDto): Promise<ModuleAction> {
    return super.update(id, dto);
  }
}
