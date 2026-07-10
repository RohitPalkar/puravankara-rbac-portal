import type { City } from 'src/types';

import apiClient from 'src/services/api-client';

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  meta?: { page: number; limit: number; total: number; totalPages: number };
}

interface CityEntity {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

function mapCity(be: CityEntity): City {
  return {
    id: String(be.id),
    name: be.name,
    code: be.name.substring(0, 3).toUpperCase(),
    zoneId: '',
    status: be.isActive !== false ? 'active' : 'inactive',
    createdAt: be.createdAt,
    updatedAt: be.updatedAt,
  };
}

export const cityApi = {
  async list(): Promise<City[]> {
    const res = await apiClient.get<ApiResponse<CityEntity[]>>('/cities');
    const raw = res.data?.data || res.data || [];
    const items = Array.isArray(raw) ? raw : [];
    return items.map(mapCity);
  },
};
