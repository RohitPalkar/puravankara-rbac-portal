import type { AppBase } from './common';

export interface AuditLog extends AppBase {
  entityName: string;
  entityId: string;
  action: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  performedBy: string;
  performerName?: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  source?: string;
}

export interface AuditQuery {
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
