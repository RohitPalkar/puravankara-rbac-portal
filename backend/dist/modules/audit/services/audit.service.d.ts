import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { AuditQueryDto } from '../dto/audit-query.dto';
export declare class AuditService {
    private readonly auditRepo;
    constructor(auditRepo: Repository<AuditLog>);
    createLog(params: {
        entityName: string;
        entityId?: string;
        action: string;
        oldValue?: Record<string, any>;
        newValue?: Record<string, any>;
        performedBy?: string;
        ipAddress?: string;
        userAgent?: string;
        requestId?: string;
        source?: string;
    }): Promise<AuditLog>;
    findAll(query: AuditQueryDto): Promise<{
        data: AuditLog[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
}
