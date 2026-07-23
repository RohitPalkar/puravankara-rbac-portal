import { apiGet } from '../api/client';
import { endpoints } from '../api/endpoints';

import type { ApiResponse } from '../types/api';
import type { AuditLog, AuditQuery } from '../types/audit';

export const auditService = {
  list: async (params?: AuditQuery): Promise<ApiResponse<AuditLog[]>> =>
    apiGet<AuditLog[]>(endpoints.auditLogs.list, params as Record<string, unknown>),
};
