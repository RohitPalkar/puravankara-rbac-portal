import apiClient from 'src/services/api-client';
import type { Module, SubModule, Action } from 'src/types';

interface ModuleEntity {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  subModules?: SubModuleEntity[];
}

interface SubModuleEntity {
  id: number;
  name: string;
  moduleId: number;
  isActive: boolean;
  module?: { name: string };
}

interface ActionEntity {
  id: number;
  name: string;
  code: string;
  label?: string;
  isActive: boolean;
}

function mapModule(be: ModuleEntity): Module {
  return {
    id: String(be.id),
    name: be.name,
    code: be.name.toUpperCase().replace(/\s+/g, '_'),
    icon: 'solar:widget-bold-duotone',
    sortOrder: be.id,
    status: be.isActive ? 'active' : 'inactive',
    createdAt: be.createdAt,
    updatedAt: be.updatedAt,
  };
}

function mapSubModule(be: SubModuleEntity): SubModule {
  return {
    id: String(be.id),
    name: be.name,
    code: be.name.toUpperCase().replace(/\s+/g, '_'),
    moduleId: String(be.moduleId),
    moduleName: be.module?.name || '',
    icon: 'solar:widget-5-bold-duotone',
    sortOrder: be.id,
    status: be.isActive ? 'active' : 'inactive',
    createdAt: '',
    updatedAt: '',
  };
}

function mapAction(be: ActionEntity): Action {
  return {
    id: String(be.id),
    name: be.label || be.name,
    code: be.code || be.name.toUpperCase().replace(/\s+/g, '_'),
    subModuleId: '',
    sortOrder: be.id,
    status: be.isActive ? 'active' : 'inactive',
    createdAt: '',
    updatedAt: '',
  };
}

export const catalogApi = {
  async getModules(): Promise<Module[]> {
    const res = await apiClient.get('/modules');
    const raw = res.data?.data || res.data || [];
    const items = Array.isArray(raw) ? raw : [];
    return items.map(mapModule);
  },

  async getModuleTree(): Promise<any> {
    const res = await apiClient.get('/modules/tree');
    return res.data?.data || res.data;
  },

  async getSubModules(): Promise<SubModule[]> {
    const res = await apiClient.get('/sub-modules');
    const raw = res.data?.data || res.data || [];
    const items = Array.isArray(raw) ? raw : [];
    return items.map(mapSubModule);
  },

  async getActions(): Promise<Action[]> {
    const res = await apiClient.get('/actions');
    const raw = res.data?.data || res.data || [];
    const items = Array.isArray(raw) ? raw : [];
    return items.map(mapAction);
  },
};
