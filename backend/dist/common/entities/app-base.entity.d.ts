export declare abstract class AppBaseEntity {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    createdBy: string;
    updatedBy: string;
}
