import apiClient from 'src/services/api-client';
import type { Role } from 'src/types';

interface RoleEntity {
  id: number;
  name: string;
  hierarchyLevelRank: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  department?: { id: number; name: string };
}

function mapRole(be: RoleEntity, deptId?: number, deptName?: string): Role {
  return {
    id: String(be.id),
    name: be.name,
    code: be.name.substring(0, 3).toUpperCase(),
    description: '',
    level: `L${be.hierarchyLevelRank || 1}`,
    departmentId: deptId ? String(deptId) : be.department ? String(be.department.id) : '',
    departmentName: deptName || be.department?.name || '',
    status: be.isActive !== false ? 'active' : 'inactive',
    createdBy: be.createdBy || '',
    createdAt: be.createdAt,
    updatedAt: be.updatedAt,
  };
}

export const roleApi = {
  async list(): Promise<Role[]> {
    const res = await apiClient.get('/roles');
    const raw = res.data?.data || res.data || [];
    const items = Array.isArray(raw) ? raw : [];
    return items.map((r: RoleEntity) => mapRole(r));
  },

  async getById(id: string): Promise<Role> {
    const res = await apiClient.get(`/roles/${id}`);
    const raw = res.data?.data || res.data;
    return mapRole(raw, raw.department?.id, raw.department?.name);
  },

  async create(data: { name: string; hierarchyLevelRank?: number; isActive?: boolean }): Promise<Role> {
    const res = await apiClient.post('/roles', data);
    const raw = res.data?.data || res.data;
    return mapRole(raw);
  },

  async update(id: string, data: { name?: string; hierarchyLevelRank?: number; isActive?: boolean }): Promise<Role> {
    const res = await apiClient.patch(`/roles/${id}`, data);
    const raw = res.data?.data || res.data;
    return mapRole(raw);
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/roles/${id}`);
  },
};
