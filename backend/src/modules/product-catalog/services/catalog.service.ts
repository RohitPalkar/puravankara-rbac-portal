import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Module as ModuleEntity } from '../entities/module.entity';
import { SubModule } from '../entities/sub-module.entity';
import { Action } from '../entities/action.entity';
import { ModuleAction } from '../entities/module-action.entity';
import { BaseService } from '../../../common/crud/base.service';
import { DependencyValidatorService } from '../../../common/services/dependency-validator.service';
import {
  CreateModuleDto,
  UpdateModuleDto,
  CreateSubModuleDto,
  UpdateSubModuleDto,
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
    const modules = await this.repository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });

    const subModules = await this.repository.manager
      .getRepository(SubModule)
      .find({ where: { isActive: true }, order: { name: 'ASC' } });

    const actions = await this.repository.manager
      .getRepository(Action)
      .find({ where: { isActive: true }, order: { code: 'ASC' } });

    const moduleActions = await this.repository.manager
      .getRepository(ModuleAction)
      .find({ where: { isActive: true } });

    return modules.map((mod) => {
      const modSubModules = subModules.filter((sm) => sm.moduleId === mod.id);
      const modDirectActions = moduleActions.filter(
        (ma) => ma.moduleId === mod.id && !ma.subModuleId,
      );
      const modActionIds = new Set(modDirectActions.map((ma) => ma.actionId));
      const modActions = actions.filter((a) => modActionIds.has(a.id));

      return {
        id: mod.id,
        name: mod.name,
        subModules: modSubModules.map((sm) => {
          const smModuleActions = moduleActions.filter(
            (ma) => ma.moduleId === mod.id && ma.subModuleId === sm.id,
          );
          const smActionIds = new Set(smModuleActions.map((ma) => ma.actionId));
          return {
            id: sm.id,
            name: sm.name,
            actions: actions
              .filter((a) => smActionIds.has(a.id))
              .map((a) => ({ id: a.id, code: a.code, label: a.label })),
          };
        }),
        actions: modActions.map((a) => ({
          id: a.id,
          code: a.code,
          label: a.label,
        })),
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
