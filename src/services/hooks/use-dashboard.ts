import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '../api/query-keys';
import { dashboardService } from '../services/dashboard.service';

export function useDashboardZoneOverview() {
  return useQuery({
    queryKey: queryKeys.dashboard.zoneOverview,
    queryFn: () => dashboardService.getZoneOverview(),
    staleTime: 120_000,
  });
}

export function useDashboardSecurityStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.securityStats,
    queryFn: () => dashboardService.getSecurityStats(),
    staleTime: 120_000,
  });
}

export function useDashboardOperationsSummary() {
  return useQuery({
    queryKey: queryKeys.dashboard.operationsSummary,
    queryFn: () => dashboardService.getOperationsSummary(),
    staleTime: 120_000,
  });
}

export function useDashboardKpis() {
  return useQuery({
    queryKey: queryKeys.dashboard.kpis,
    queryFn: () => dashboardService.getKpis(),
    staleTime: 120_000,
  });
}
