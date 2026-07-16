import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { SubModule } from './sub-module.entity';
import { ModuleAction } from './module-action.entity';
export declare class Module extends AppBaseEntity {
    name: string;
    isActive: boolean;
    subModules: SubModule[];
    moduleActions: ModuleAction[];
}
