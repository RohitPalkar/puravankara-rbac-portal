import { User } from '../../users/entities/user.entity';
export declare class UserAuth {
    userId: string;
    passwordHash: string;
    authProvider: string;
    lastLogin: Date;
    failedAttempts: number;
    isLocked: boolean;
    createdAt: Date;
    updatedAt: Date;
    user: User;
}
