import { AuditService } from '../services/audit.service';
import { AuditQueryDto } from '../dto/audit-query.dto';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    findAll(query: AuditQueryDto): Promise<{
        data: import("../entities/audit-log.entity").AuditLog[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
}
