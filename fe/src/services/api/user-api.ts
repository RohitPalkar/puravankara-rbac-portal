import type { User } from 'src/types';

import apiClient from 'src/services/api-client';

interface CreateUserFullDto {
  basic: {
    name: string;
    email: string;
    departmentId: number;
    employeeId?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    mobile?: string;
    userGroup?: string;
    startDate?: string;
    endDate?: string;
    employmentStatus?: string;
    isActive?: boolean;
  };
  organization: {
    zones: number[];
    primaryRole: number;
    secondaryRoles?: number[];
    reporting?: Array<{
      levelRank: number;
      managerId: string;
    }>;
  };
}

interface BulkProjectAccessDto {
  userId: string;
  assignments: Array<{
    projectId: number;
    accessType?: string;
  }>;
}

function mapUserFromApi(raw: any): User {
  return {
    id: raw.empId,
    employeeId: raw.empId,
    firstName: raw.firstName ?? '',
    lastName: raw.lastName ?? '',
    name: raw.name ?? '',
    email: raw.email ?? '',
    phone: raw.phone ?? '',
    departmentId: String(raw.departmentId ?? ''),
    departmentName: raw.department?.name,
    roleId: raw.roleId ?? '',
    roleName: raw.roleName,
    secondaryRoleId: raw.secondaryRoleId,
    secondaryRoleName: raw.secondaryRoleName,
    level: raw.level ?? '',
    employmentStatus: (raw.employmentStatus ?? '').toLowerCase() as User['employmentStatus'],
    userGroup: raw.userGroup,
    startDate: raw.startDate,
    endDate: raw.endDate,
    reportingManagerId: raw.reportingManagerId,
    reportingManagerName: raw.reportingManagerName,
    zoneIds: raw.zoneIds ?? [],
    zoneNames: raw.zoneNames,
    createdBy: raw.createdBy ?? '',
    status: raw.isActive === true ? 'active' : 'inactive',
    projects: raw.projects,
    createdAt: raw.createdAt ?? '',
    updatedAt: raw.updatedAt ?? '',
  };
}

export const userApi = {
  async createFull(dto: CreateUserFullDto): Promise<{ user: any; generatedPassword?: string }> {
    const res = await apiClient.post('/users/full', dto);
    const raw = res.data?.data || res.data;
    return raw;
  },

  async list(): Promise<User[]> {
    const res = await apiClient.get('/users');
    const raw = res.data?.data || res.data || [];
    const items = Array.isArray(raw) ? raw : raw?.data || [];
    return (items ?? []).map(mapUserFromApi);
  },

  async getById(id: string): Promise<User> {
    const res = await apiClient.get(`/users/${id}`);
    const raw = res.data?.data || res.data;
    return mapUserFromApi(raw);
  },

  async bulkProjectAccess(dto: BulkProjectAccessDto): Promise<void> {
    await apiClient.post('/user-project-access/bulk', dto);
  },

  async assignRole(data: { userId: string; departmentId: number; roleId: number }): Promise<void> {
    await apiClient.post('/user-roles', data);
  },

  async assignZones(userId: string, zoneIds: number[]): Promise<void> {
    await Promise.all(zoneIds.map((zoneId) => apiClient.post('/user-zones', { userId, zoneId })));
  },

  async deactivate(id: string): Promise<void> {
    await apiClient.patch(`/users/${id}`, { isActive: false });
  },
};
