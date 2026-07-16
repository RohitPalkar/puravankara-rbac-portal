import type { Department } from 'src/types';

import apiClient from 'src/services/api-client';

interface DepartmentEntity {
  id: number;
  name: string;
  maxHierarchyLevels: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

function mapDepartment(be: DepartmentEntity): Department {
  return {
    id: String(be.id),
    name: be.name,
    maxHierarchyLevels: be.maxHierarchyLevels ?? 4,
    status: be.isActive !== false ? 'active' : 'inactive',
    createdBy: be.createdBy || '',
    createdAt: be.createdAt,
    updatedAt: be.updatedAt,
  };
}

export const departmentApi = {
  async list(): Promise<Department[]> {
    const res = await apiClient.get('/departments');
    const raw = res.data?.data || res.data || [];
    const items = Array.isArray(raw) ? raw : [];
    return items.map(mapDepartment);
  },

  async getById(id: string): Promise<Department> {
    const res = await apiClient.get(`/departments/${id}`);
    const raw = res.data?.data || res.data;
    return mapDepartment(raw);
  },

  async create(data: { name: string; maxHierarchyLevels?: number; isActive?: boolean }): Promise<Department> {
    const res = await apiClient.post('/departments', data);
    const raw = res.data?.data || res.data;
    return mapDepartment(raw);
  },

  async update(id: string, data: { name?: string; maxHierarchyLevels?: number; isActive?: boolean }): Promise<Department> {
    const res = await apiClient.patch(`/departments/${id}`, data);
    const raw = res.data?.data || res.data;
    return mapDepartment(raw);
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/departments/${id}`);
  },
};
