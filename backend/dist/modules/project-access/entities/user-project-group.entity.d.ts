import { User } from '../../users/entities/user.entity';
import { ProjectGroup } from './project-group.entity';
export declare class UserProjectGroup {
    userId: string;
    groupId: number;
    assignedBy: string;
    assignedAt: Date;
    user: User;
    group: ProjectGroup;
    createdAt: Date;
    updatedAt: Date;
}
