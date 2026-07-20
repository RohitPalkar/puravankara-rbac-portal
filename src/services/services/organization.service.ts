import { apiGet, apiPost, apiDelete } from '../api/client';
import { createCrudService } from '../api/crud';
import { endpoints } from '../api/endpoints';
import type { ApiResponse } from '../types/api';
import type {
  Department,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  DepartmentRole,
} from '../types/organization';

export const departmentService = createCrudService<Department, CreateDepartmentRequest, UpdateDepartmentRequest>({
  list: endpoints.departments.list,
  byId: endpoints.departments.byId,
  create: endpoints.departments.create,
  update: endpoints.departments.update,
  delete: endpoints.departments.delete,
});

export const roleService = createCrudService<Role, CreateRoleRequest, UpdateRoleRequest>({
  list: endpoints.roles.list,
  byId: endpoints.roles.byId,
  create: endpoints.roles.create,
  update: endpoints.roles.update,
  delete: endpoints.roles.delete,
});

export const departmentRoleService = {
  list: async (): Promise<ApiResponse<DepartmentRole[]>> =>
    apiGet<DepartmentRole[]>(endpoints.departmentRoles.list),

  create: async (departmentId: number, roleId: number): Promise<ApiResponse<DepartmentRole>> =>
    apiPost<DepartmentRole>(endpoints.departmentRoles.create, { departmentId, roleId }),

  delete: async (departmentId: number, roleId: number): Promise<ApiResponse<void>> =>
    apiDelete<void>(endpoints.departmentRoles.delete(departmentId, roleId)),
};
