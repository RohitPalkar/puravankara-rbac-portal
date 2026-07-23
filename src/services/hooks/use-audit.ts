import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '../api/query-keys';
import { auditService } from '../services/audit.service';

import type { AuditQuery } from '../types/audit';

export function useAuditLogList(params?: AuditQuery) {
  return useQuery({
    queryKey: queryKeys.auditLogs.list(params as Record<string, unknown>),
    queryFn: async () => {
      const res = await auditService.list(params);
      return res.data;
    },
  });
}
