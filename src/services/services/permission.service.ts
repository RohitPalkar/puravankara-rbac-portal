import { apiGet, apiPost, apiPut, apiDelete } from '../api/client';
import { createCrudService, createEntity } from '../api/crud';
import { endpoints } from '../api/endpoints';
import type { ApiResponse } from '../types/api';
import type {
  PermissionTemplate,
  CreatePermissionTemplateRequest,
  UpdatePermissionTemplateRequest,
  RoleProjectPermission,
  CreateRoleProjectPermissionRequest,
  UserPermissionOverride,
  CreateOverrideRequest,
  ExplainPermissionRequest,
  ExplainPermissionResponse,
  UserPermissionsResponse,
  SetPermissionsRequest,
  FlatModule,
} from '../types/permission';
import type { CompiledPermissions } from '../types/auth';

export const permissionTemplateService = createCrudService<
  PermissionTemplate,
  CreatePermissionTemplateRequest,
  UpdatePermissionTemplateRequest
>({
  list: endpoints.permissions.templates.list,
  byId: endpoints.permissions.templates.byId,
  create: endpoints.permissions.templates.create,
  update: endpoints.permissions.templates.update,
  delete: endpoints.permissions.templates.delete,
});

export const permissionService = {
  getMyPermissions: async (): Promise<ApiResponse<CompiledPermissions>> =>
    apiGet<CompiledPermissions>(endpoints.permissions.me),

  getUserPermissions: async (userId: string): Promise<ApiResponse<UserPermissionsResponse>> =>
    apiGet<UserPermissionsResponse>(endpoints.permissions.user(userId)),

  compile: async (userId: string): Promise<ApiResponse<void>> =>
    apiPost<void>(endpoints.permissions.compile(userId)),

  compileForProject: async (userId: string, projectId: number): Promise<ApiResponse<void>> =>
    apiPost<void>(endpoints.permissions.compileForProject(userId, projectId)),

  snapshot: async (userId: string, projectId: number): Promise<ApiResponse<unknown>> =>
    apiGet<unknown>(endpoints.permissions.snapshot(userId, projectId)),

  explain: async (data: ExplainPermissionRequest): Promise<ApiResponse<ExplainPermissionResponse>> =>
    apiPost<ExplainPermissionResponse>(endpoints.permissions.explain, data),

  templates: {
    permissions: {
      list: async (templateId: number): Promise<ApiResponse<FlatModule[]>> =>
        apiGet<FlatModule[]>(endpoints.permissions.templates.permissions.list(templateId)),

      set: async (templateId: number, data: SetPermissionsRequest): Promise<ApiResponse<void>> =>
        apiPost<void>(endpoints.permissions.templates.permissions.set(templateId), data),
    },
  },

  roleProject: {
    list: async (): Promise<ApiResponse<RoleProjectPermission[]>> =>
      apiGet<RoleProjectPermission[]>(endpoints.permissions.roleProject.list),

    byRole: async (roleId: number): Promise<ApiResponse<RoleProjectPermission[]>> =>
      apiGet<RoleProjectPermission[]>(endpoints.permissions.roleProject.byRole(roleId)),

    byRoleAndProject: async (
      roleId: number,
      projectId: number
    ): Promise<ApiResponse<RoleProjectPermission[]>> =>
      apiGet<RoleProjectPermission[]>(
        endpoints.permissions.roleProject.byRoleAndProject(roleId, projectId)
      ),

    create: async (
      data: CreateRoleProjectPermissionRequest
    ): Promise<ApiResponse<RoleProjectPermission>> =>
      createEntity<RoleProjectPermission, CreateRoleProjectPermissionRequest>(
        endpoints.permissions.roleProject.create,
        data
      ),

    delete: async (id: number): Promise<ApiResponse<void>> =>
      apiDelete<void>(endpoints.permissions.roleProject.delete(id)),
  },

  overrides: {
    byUser: async (userId: string): Promise<ApiResponse<UserPermissionOverride[]>> =>
      apiGet<UserPermissionOverride[]>(endpoints.permissions.overrides.byUser(userId)),

    byUserAndProject: async (
      userId: string,
      projectId: number
    ): Promise<ApiResponse<UserPermissionOverride[]>> =>
      apiGet<UserPermissionOverride[]>(
        endpoints.permissions.overrides.byUserAndProject(userId, projectId)
      ),

    create: async (data: CreateOverrideRequest): Promise<ApiResponse<UserPermissionOverride>> =>
      createEntity<UserPermissionOverride, CreateOverrideRequest>(
        endpoints.permissions.overrides.create,
        data
      ),

    delete: async (id: number): Promise<ApiResponse<void>> =>
      apiDelete<void>(endpoints.permissions.overrides.delete(id)),
  },

  rolePermissions: {
    summary: async (): Promise<ApiResponse<any[]>> =>
      apiGet<any[]>(endpoints.roles.permissionsSummary),

    byRole: async (roleId: number): Promise<ApiResponse<{ roleId: number; actionIds: number[] }>> =>
      apiGet<{ roleId: number; actionIds: number[] }>(endpoints.roles.permissions.byRole(roleId)),

    tree: async (roleId: number): Promise<ApiResponse<any>> =>
      apiGet<any>(endpoints.roles.permissions.tree(roleId)),

    set: async (roleId: number, data: { actionIds: number[] }): Promise<ApiResponse<{ message: string }>> =>
      apiPut<{ message: string }>(endpoints.roles.permissions.set(roleId), data),
  },
};
