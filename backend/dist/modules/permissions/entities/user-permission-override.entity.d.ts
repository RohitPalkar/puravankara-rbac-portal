import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { User } from '../../users/entities/user.entity';
import { Project } from '../../projects/entities/project.entity';
import { Module } from '../../product-catalog/entities/module.entity';
import { SubModule } from '../../product-catalog/entities/sub-module.entity';
import { Action } from '../../product-catalog/entities/action.entity';
import { PermissionType } from '../../../common/enums';
export declare class UserPermissionOverride extends AppBaseEntity {
    userId: string;
    projectId: number;
    moduleId: number;
    subModuleId: number;
    actionId: number;
    permissionType: PermissionType;
    reason: string;
    user: User;
    project: Project;
    module: Module;
    subModule: SubModule;
    action: Action;
}
