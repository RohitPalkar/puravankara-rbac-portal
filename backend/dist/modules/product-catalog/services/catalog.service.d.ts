import { Repository } from 'typeorm';
import { Module as ModuleEntity } from '../entities/module.entity';
import { SubModule } from '../entities/sub-module.entity';
import { Action } from '../entities/action.entity';
import { ModuleAction } from '../entities/module-action.entity';
import { BaseService } from '../../../common/crud/base.service';
import { DependencyValidatorService } from '../../../common/services/dependency-validator.service';
import { CreateModuleDto, UpdateModuleDto, CreateSubModuleDto, UpdateSubModuleDto, CreateActionDto, UpdateActionDto, CreateModuleActionDto, UpdateModuleActionDto } from '../dto/catalog.dto';
export declare class ModuleCatalogService extends BaseService<ModuleEntity> {
    readonly repository: Repository<ModuleEntity>;
    private readonly dependencyValidator;
    constructor(repository: Repository<ModuleEntity>, dependencyValidator: DependencyValidatorService);
    create(dto: CreateModuleDto): Promise<ModuleEntity>;
    update(id: number, dto: UpdateModuleDto): Promise<ModuleEntity>;
    remove(id: number): Promise<void>;
    getTree(): Promise<any[]>;
}
export declare class SubModuleCatalogService extends BaseService<SubModule> {
    readonly repository: Repository<SubModule>;
    constructor(repository: Repository<SubModule>);
    create(dto: CreateSubModuleDto): Promise<SubModule>;
    update(id: number, dto: UpdateSubModuleDto): Promise<SubModule>;
}
export declare class ActionCatalogService extends BaseService<Action> {
    readonly repository: Repository<Action>;
    constructor(repository: Repository<Action>);
    create(dto: CreateActionDto): Promise<Action>;
    update(id: number, dto: UpdateActionDto): Promise<Action>;
}
export declare class ModuleActionCatalogService extends BaseService<ModuleAction> {
    readonly repository: Repository<ModuleAction>;
    constructor(repository: Repository<ModuleAction>);
    create(dto: CreateModuleActionDto): Promise<ModuleAction>;
    update(id: number, dto: UpdateModuleActionDto): Promise<ModuleAction>;
}
