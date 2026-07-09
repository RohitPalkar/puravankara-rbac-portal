import apiClient from 'src/services/api-client';
import type { Project } from 'src/types';

interface ProjectEntity {
  id: number;
  name: string;
  isActive: boolean;
  billingEntityName?: string;
  billingGstin?: string;
  extendedMetadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

function mapProject(be: ProjectEntity): Project {
  const meta = be.extendedMetadata || {};
  return {
    id: String(be.id),
    name: be.name,
    code: be.name.substring(0, 3).toUpperCase(),
    brand: meta.brand || '',
    zoneId: meta.zoneId ? String(meta.zoneId) : '',
    zoneName: meta.zoneName || '',
    cityId: meta.cityId ? String(meta.cityId) : '',
    cityName: meta.cityName || '',
    phase: meta.phase || '',
    billingEntity: be.billingEntityName || '',
    billingAddress: meta.billingAddress || '',
    gstin: be.billingGstin || '',
    paymentGateway: meta.paymentGateway || '',
    projectImage: meta.projectImage || '',
    jvImage: meta.jvImage || '',
    incentiveCriteria: meta.incentiveCriteria || '',
    startDate: meta.startDate || '',
    endDate: meta.endDate || '',
    status: be.isActive !== false ? 'active' : 'inactive',
    createdBy: be.createdBy || '',
    createdAt: be.createdAt,
    updatedAt: be.updatedAt,
  };
}

export const projectApi = {
  async list(): Promise<Project[]> {
    const res = await apiClient.get('/projects');
    const raw = res.data?.data || res.data || [];
    const items = Array.isArray(raw) ? raw : [];
    return items.map(mapProject);
  },

  async getById(id: string): Promise<Project> {
    const res = await apiClient.get(`/projects/${id}`);
    const raw = res.data?.data || res.data;
    return mapProject(raw);
  },

  async create(data: {
    name: string;
    billingEntityName?: string;
    billingGstin?: string;
    extendedMetadata?: Record<string, any>;
    isActive?: boolean;
  }): Promise<Project> {
    const res = await apiClient.post('/projects', data);
    const raw = res.data?.data || res.data;
    return mapProject(raw);
  },

  async update(id: string, data: {
    name?: string;
    billingEntityName?: string;
    billingGstin?: string;
    extendedMetadata?: Record<string, any>;
    isActive?: boolean;
  }): Promise<Project> {
    const res = await apiClient.patch(`/projects/${id}`, data);
    const raw = res.data?.data || res.data;
    return mapProject(raw);
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/projects/${id}`);
  },
};
