import { User } from '../../users/entities/user.entity';
export declare class UserSession {
    id: string;
    userId: string;
    tokenHash: string;
    ipAddress: string;
    userAgent: string;
    createdAt: Date;
    updatedAt: Date;
    expiresAt: Date;
    user: User;
}
