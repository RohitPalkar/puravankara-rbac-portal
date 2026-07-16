import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { PermissionTemplate } from './permission-template.entity';
import { Module } from '../../product-catalog/entities/module.entity';
import { SubModule } from '../../product-catalog/entities/sub-module.entity';
import { Action } from '../../product-catalog/entities/action.entity';
export declare class TemplatePermission extends AppBaseEntity {
    templateId: number;
    moduleId: number;
    subModuleId: number;
    actionId: number;
    template: PermissionTemplate;
    module: Module;
    subModule: SubModule;
    action: Action;
}
