import type { Zone } from 'src/types';

import apiClient from 'src/services/api-client';

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  meta?: { page: number; limit: number; total: number; totalPages: number };
}

interface ZoneEntity {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

function mapZone(be: ZoneEntity): Zone {
  return {
    id: String(be.id),
    name: be.name,
    code: be.name.substring(0, 3).toUpperCase(),
    description: '',
    status: be.isActive !== false ? 'active' : 'inactive',
    createdBy: be.createdBy || '',
    createdAt: be.createdAt,
    updatedAt: be.updatedAt,
  };
}

export const zoneApi = {
  async list(): Promise<Zone[]> {
    const res = await apiClient.get<ApiResponse<ZoneEntity[]>>('/zones');
    const raw = res.data?.data || res.data || [];
    const items = Array.isArray(raw) ? raw : [];
    return items.map(mapZone);
  },

  async getById(id: string): Promise<Zone> {
    const res = await apiClient.get<ApiResponse<ZoneEntity>>(`/zones/${id}`);
    const raw = res.data?.data || res.data;
    return mapZone(raw);
  },

  async create(data: { name: string; isActive?: boolean }): Promise<Zone> {
    const res = await apiClient.post<ApiResponse<ZoneEntity>>('/zones', data);
    const raw = res.data?.data || res.data;
    return mapZone(raw);
  },

  async update(id: string, data: { name?: string; isActive?: boolean }): Promise<Zone> {
    const res = await apiClient.patch<ApiResponse<ZoneEntity>>(`/zones/${id}`, data);
    const raw = res.data?.data || res.data;
    return mapZone(raw);
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/zones/${id}`);
  },
};
