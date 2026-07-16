import { ModuleCatalogService, SubModuleCatalogService, ActionCatalogService, ModuleActionCatalogService } from '../services/catalog.service';
import { CreateModuleDto, UpdateModuleDto, CreateSubModuleDto, UpdateSubModuleDto, CreateActionDto, UpdateActionDto, CreateModuleActionDto, UpdateModuleActionDto } from '../dto/catalog.dto';
import { Module as ModuleEntity } from '../entities/module.entity';
import { SubModule } from '../entities/sub-module.entity';
import { Action } from '../entities/action.entity';
import { ModuleAction } from '../entities/module-action.entity';
import { BaseController } from '../../../common/crud/base.controller';
export declare class ModuleController extends BaseController<ModuleEntity, CreateModuleDto, UpdateModuleDto> {
    private readonly svc;
    constructor(svc: ModuleCatalogService);
    getTree(): Promise<any[]>;
}
export declare class SubModuleController extends BaseController<SubModule, CreateSubModuleDto, UpdateSubModuleDto> {
    private readonly svc;
    constructor(svc: SubModuleCatalogService);
}
export declare class ActionController extends BaseController<Action, CreateActionDto, UpdateActionDto> {
    private readonly svc;
    constructor(svc: ActionCatalogService);
}
export declare class ModuleActionController extends BaseController<ModuleAction, CreateModuleActionDto, UpdateModuleActionDto> {
    private readonly svc;
    constructor(svc: ModuleActionCatalogService);
}
