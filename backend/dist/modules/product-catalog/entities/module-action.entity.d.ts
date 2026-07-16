import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { Module } from './module.entity';
import { SubModule } from './sub-module.entity';
import { Action } from './action.entity';
export declare class ModuleAction extends AppBaseEntity {
    moduleId: number;
    subModuleId: number;
    actionId: number;
    isActive: boolean;
    module: Module;
    subModule: SubModule;
    action: Action;
}
