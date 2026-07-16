import { ProjectLocationService } from '../services/project-location.service';
declare class ProjectLocationDto {
    projectId: number;
    cityId: number;
    zoneId: number;
}
export declare class ProjectLocationController {
    private readonly svc;
    constructor(svc: ProjectLocationService);
    findAll(): Promise<import("../entities/project-location.entity").ProjectLocation[]>;
    findByZone(zoneId: string): Promise<import("../entities/project-location.entity").ProjectLocation[]>;
    findByProject(projectId: string): Promise<import("../entities/project-location.entity").ProjectLocation[]>;
    create(dto: ProjectLocationDto): Promise<import("../entities/project-location.entity").ProjectLocation>;
    remove(projectId: string, cityId: string, zoneId: string): Promise<{
        message: string;
    }>;
}
export {};
