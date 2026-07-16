import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { Module } from './module.entity';
export declare class SubModule extends AppBaseEntity {
    moduleId: number;
    name: string;
    isActive: boolean;
    module: Module;
}
