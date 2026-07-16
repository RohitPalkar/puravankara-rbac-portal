import { AppBaseEntity } from '../../../common/entities/app-base.entity';
export declare class AuditLog extends AppBaseEntity {
    entityName: string;
    entityId: string;
    action: string;
    oldValue: Record<string, any>;
    newValue: Record<string, any>;
    performedBy: string;
    ipAddress: string;
    userAgent: string;
    requestId: string;
    source: string;
}
