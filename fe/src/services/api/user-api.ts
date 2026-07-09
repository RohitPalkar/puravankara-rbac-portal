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
    return items;
  },

  async getById(id: string): Promise<User> {
    const res = await apiClient.get(`/users/${id}`);
    return res.data?.data || res.data;
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
