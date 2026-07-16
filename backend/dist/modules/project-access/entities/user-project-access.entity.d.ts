import { User } from '../../users/entities/user.entity';
import { Project } from '../../projects/entities/project.entity';
export declare class UserProjectAccess {
    userId: string;
    projectId: number;
    assignedBy: string;
    assignedAt: Date;
    user: User;
    project: Project;
    createdAt: Date;
    updatedAt: Date;
}
