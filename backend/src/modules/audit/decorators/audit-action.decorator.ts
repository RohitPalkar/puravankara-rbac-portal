import { SetMetadata } from '@nestjs/common';

export const AUDIT_ACTION_KEY = 'auditAction';

export interface AuditActionOptions {
  entity: string;
  action: string;
}

export const AuditAction = (options: AuditActionOptions) =>
  SetMetadata(AUDIT_ACTION_KEY, options);
