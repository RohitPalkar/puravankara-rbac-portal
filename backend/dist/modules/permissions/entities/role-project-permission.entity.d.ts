import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { Role } from '../../organization/entities/role.entity';
import { Project } from '../../projects/entities/project.entity';
import { Module } from '../../product-catalog/entities/module.entity';
import { SubModule } from '../../product-catalog/entities/sub-module.entity';
import { Action } from '../../product-catalog/entities/action.entity';
export declare class RoleProjectPermission extends AppBaseEntity {
    roleId: number;
    projectId: number;
    moduleId: number;
    subModuleId: number;
    actionId: number;
    role: Role;
    project: Project;
    module: Module;
    subModule: SubModule;
    action: Action;
}
