import { User } from '../../users/entities/user.entity';
import { Project } from '../../projects/entities/project.entity';
import { PermissionTemplate } from './permission-template.entity';
export declare class UserPermissionTemplate {
    userId: string;
    projectId: number;
    templateId: number;
    assignedBy: string;
    assignedAt: Date;
    user: User;
    project: Project;
    template: PermissionTemplate;
    createdAt: Date;
    updatedAt: Date;
}
