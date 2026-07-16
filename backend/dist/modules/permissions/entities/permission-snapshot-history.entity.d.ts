import { User } from '../../users/entities/user.entity';
import { Project } from '../../projects/entities/project.entity';
export declare class PermissionSnapshotHistory {
    id: number;
    userId: string;
    projectId: number;
    snapshot: Record<string, any>;
    changedBy: string;
    createdAt: Date;
    user: User;
    project: Project;
}
