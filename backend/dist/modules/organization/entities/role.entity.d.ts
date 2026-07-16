import { AppBaseEntity } from '../../../common/entities/app-base.entity';
export declare class Role extends AppBaseEntity {
    name: string;
    hierarchyLevelRank: number;
    isActive: boolean;
    isSystemRole: boolean;
}
