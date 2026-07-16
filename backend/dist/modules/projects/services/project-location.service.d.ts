import { Repository } from 'typeorm';
import { ProjectLocation } from '../entities/project-location.entity';
export declare class ProjectLocationService {
    readonly repository: Repository<ProjectLocation>;
    constructor(repository: Repository<ProjectLocation>);
    findAll(): Promise<ProjectLocation[]>;
    findByProject(projectId: number): Promise<ProjectLocation[]>;
    create(dto: {
        projectId: number;
        cityId: number;
        zoneId: number;
    }): Promise<ProjectLocation>;
    findByZone(zoneId: number): Promise<ProjectLocation[]>;
    remove(projectId: number, cityId: number, zoneId: number): Promise<void>;
}
