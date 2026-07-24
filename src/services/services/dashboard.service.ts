import { apiGet } from '../api/client';
import { endpoints } from '../api/endpoints';

export interface ZoneOverviewItem {
  id: number;
  name: string;
  project_count: number;
  user_count: number;
}

export interface SecurityStats {
  todayLogins: number;
  failedLogins: number;
  lockedAccounts: number;
  passwordExpiring: number;
}

export interface OperationsSummary {
  pendingApprovals: number;
  permissionRequests: number;
  usersWithoutRoles: number;
  inactiveUsers: number;
}

export interface KpiData {
  totalUsers: number;
  activeUsers: number;
  totalProjects: number;
  departments: number;
  permissionProfiles: number;
  todayEvents: number;
}

export const dashboardService = {
  getZoneOverview: async (): Promise<ZoneOverviewItem[]> => {
    const res = await apiGet<ZoneOverviewItem[]>(endpoints.dashboard.zoneOverview);
    return res.data;
  },

  getSecurityStats: async (): Promise<SecurityStats> => {
    const res = await apiGet<SecurityStats>(endpoints.dashboard.securityStats);
    return res.data;
  },

  getOperationsSummary: async (): Promise<OperationsSummary> => {
    const res = await apiGet<OperationsSummary>(endpoints.dashboard.operationsSummary);
    return res.data;
  },

  getKpis: async (): Promise<KpiData> => {
    const res = await apiGet<KpiData>(endpoints.dashboard.kpis);
    return res.data;
  },
};
