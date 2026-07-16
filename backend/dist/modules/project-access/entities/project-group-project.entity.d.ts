import { ProjectGroup } from './project-group.entity';
import { Project } from '../../projects/entities/project.entity';
export declare class ProjectGroupProject {
    groupId: number;
    projectId: number;
    group: ProjectGroup;
    project: Project;
    createdAt: Date;
    updatedAt: Date;
}
