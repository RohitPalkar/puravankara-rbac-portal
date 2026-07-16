import { User } from './user.entity';
export declare class UserReportingLine {
    userId: string;
    reportsToUserId: string;
    levelRank: number;
    effectiveFrom: Date;
    effectiveTo: Date;
    user: User;
    reportsTo: User;
    createdAt: Date;
    updatedAt: Date;
}
