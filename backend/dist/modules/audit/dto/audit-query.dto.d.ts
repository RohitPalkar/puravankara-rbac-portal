export declare class AuditQueryDto {
    entityName?: string;
    action?: string;
    performedBy?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}
