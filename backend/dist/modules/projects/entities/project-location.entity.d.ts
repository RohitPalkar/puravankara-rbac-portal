import { Project } from './project.entity';
import { City } from '../../geography/entities/city.entity';
import { Zone } from '../../geography/entities/zone.entity';
export declare class ProjectLocation {
    projectId: number;
    cityId: number;
    zoneId: number;
    project: Project;
    city: City;
    zone: Zone;
    createdAt: Date;
    updatedAt: Date;
}
