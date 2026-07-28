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

export function useDashboardOperationsSummary(zoneId?: number) {
  return useQuery({
    queryKey: [...queryKeys.dashboard.operationsSummary, zoneId].filter(Boolean),
    queryFn: () => dashboardService.getOperationsSummary(zoneId),
    staleTime: 120_000,
  });
}

export function useDashboardKpis(zoneId?: number) {
  return useQuery({
    queryKey: [...queryKeys.dashboard.kpis, zoneId].filter(Boolean),
    queryFn: () => dashboardService.getKpis(zoneId),
    staleTime: 120_000,
  });
}

export function useDashboardSystemInfo() {
  return useQuery({
    queryKey: queryKeys.dashboard.systemInfo,
    queryFn: () => dashboardService.getSystemInfo(),
    staleTime: 60_000,
  });
}
