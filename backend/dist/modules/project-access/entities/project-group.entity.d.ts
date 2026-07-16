import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { ProjectGroupProject } from './project-group-project.entity';
export declare class ProjectGroup extends AppBaseEntity {
    name: string;
    description: string;
    isActive: boolean;
    projectGroupProjects: ProjectGroupProject[];
}
