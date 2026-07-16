import { User } from '../../users/entities/user.entity';
import { Project } from '../../projects/entities/project.entity';
export declare class UserProjectFeatureMatrix {
    id: number;
    userId: string;
    projectId: number;
    featurePrivilegesDocument: Record<string, any>;
    generatedAt: Date;
    version: number;
    user: User;
    project: Project;
}
