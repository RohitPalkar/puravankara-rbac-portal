import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { Module } from '../../product-catalog/entities/module.entity';
import { SubModule } from '../../product-catalog/entities/sub-module.entity';
import { Action } from '../../product-catalog/entities/action.entity';
export declare class ApprovalWorkflow extends AppBaseEntity {
    name: string;
    moduleId: number;
    subModuleId: number;
    actionId: number;
    isActive: boolean;
    module: Module;
    subModule: SubModule;
    action: Action;
}
