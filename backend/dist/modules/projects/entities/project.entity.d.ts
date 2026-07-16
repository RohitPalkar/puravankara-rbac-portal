import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { ProjectLocation } from './project-location.entity';
export declare class Project extends AppBaseEntity {
    name: string;
    billingEntityName: string;
    billingGstin: string;
    isActive: boolean;
    extendedMetadata: Record<string, any>;
    locations: ProjectLocation[];
}
