export declare const AUDIT_ACTION_KEY = "auditAction";
export interface AuditActionOptions {
    entity: string;
    action: string;
}
export declare const AuditAction: (options: AuditActionOptions) => import("@nestjs/common").CustomDecorator<string>;
