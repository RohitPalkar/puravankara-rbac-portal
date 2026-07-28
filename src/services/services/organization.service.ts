import { endpoints } from '../api/endpoints';
import { createCrudService } from '../api/crud';
import { apiGet, apiPost, apiDelete } from '../api/client';

import type { ApiResponse } from '../types/api';
import type {
  Role,
  Department,
  DepartmentRole,
  AutoMergeResult,
  CreateRoleRequest,
  UpdateRoleRequest,
  RemoveLevelResult,
  LevelImpactPreview,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  CheckDepartmentNameResult,
} from '../types/organization';

const _departmentCrud = createCrudService<Department, CreateDepartmentRequest, UpdateDepartmentRequest>({
  list: endpoints.departments.list,
  byId: endpoints.departments.byId,
  create: endpoints.departments.create,
  update: endpoints.departments.update,
  delete: endpoints.departments.delete,
});

export const departmentService = {
  ..._departmentCrud,
  hierarchyLevels: async (id: number): Promise<ApiResponse<any[]>> =>
    apiGet<any[]>(endpoints.departments.hierarchyLevels(id)),
  roleForHierarchy: async (id: number, levelNumber: number): Promise<ApiResponse<{ hierarchyLevel: string; roleName: string | null; roleId: number | null }>> =>
    apiGet<{ hierarchyLevel: string; roleName: string | null; roleId: number | null }>(endpoints.departments.roleForHierarchy(id, levelNumber)),
  checkName: async (name: string, zoneId: number, excludeId?: number): Promise<ApiResponse<CheckDepartmentNameResult>> =>
    apiGet<CheckDepartmentNameResult>(endpoints.departments.checkName(name, zoneId, excludeId)),
};

export const roleService = createCrudService<Role, CreateRoleRequest, UpdateRoleRequest>({
  list: endpoints.roles.list,
  byId: endpoints.roles.byId,
  create: endpoints.roles.create,
  update: endpoints.roles.update,
  delete: endpoints.roles.delete,
});

export interface RemoveRolePayload {
  mode: 'MERGE' | 'REPLACE';
  destinationRoleId: number;
}

export interface RemoveRoleResult {
  message: string;
  destinationRole: Role;
}

export interface DependencyCounts {
  users: number;
  permissions: number;
  projectPermissions: number;
  approvalSteps: number;
  departmentMappings: number;
  total: number;
}

export interface RemoveCheckResult {
  autoMerge: boolean;
  message?: string;
  destinationRole?: Role;
}

export const roleMigrationService = {
  remove: async (id: number, payload: RemoveRolePayload): Promise<ApiResponse<RemoveRoleResult>> =>
    apiPost<RemoveRoleResult>(endpoints.roles.remove(id), payload),

  checkRemove: async (id: number): Promise<ApiResponse<RemoveCheckResult>> =>
    apiGet<RemoveCheckResult>(endpoints.roles.removeCheck(id)),

  getDependencies: async (id: number): Promise<ApiResponse<DependencyCounts>> =>
    apiGet<DependencyCounts>(endpoints.roles.removeDependencies(id)),
};

export interface LevelMigrationPayload {
  mode: 'MERGE' | 'REPLACE';
  destinationLevelNumber?: number;
}

export const levelMigrationService = {
  getImpact: async (departmentId: number, levelNumber: number): Promise<ApiResponse<LevelImpactPreview>> =>
    apiGet<LevelImpactPreview>(endpoints.departments.levelImpact(departmentId, levelNumber)),

  remove: async (departmentId: number, levelNumber: number, payload: LevelMigrationPayload): Promise<ApiResponse<RemoveLevelResult>> =>
    apiPost<RemoveLevelResult>(endpoints.departments.levelRemove(departmentId, levelNumber), payload),

  checkRemove: async (departmentId: number, levelNumber: number): Promise<ApiResponse<AutoMergeResult>> =>
    apiGet<AutoMergeResult>(endpoints.departments.levelRemoveCheck(departmentId, levelNumber)),
};

export const departmentRoleService = {
  list: async (): Promise<ApiResponse<DepartmentRole[]>> =>
    apiGet<DepartmentRole[]>(endpoints.departmentRoles.list),

  create: async (departmentId: number, roleId: number): Promise<ApiResponse<DepartmentRole>> =>
    apiPost<DepartmentRole>(endpoints.departmentRoles.create, { departmentId, roleId }),

  delete: async (departmentId: number, roleId: number): Promise<ApiResponse<void>> =>
    apiDelete<void>(endpoints.departmentRoles.delete(departmentId, roleId)),
};
