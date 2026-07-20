import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '../api/query-keys';
import {
  permissionService,
  permissionTemplateService,
} from '../services/permission.service';
import type {
  PermissionTemplate,
  CreatePermissionTemplateRequest,
  UpdatePermissionTemplateRequest,
  CreateRoleProjectPermissionRequest,
  CreateOverrideRequest,
  ExplainPermissionRequest,
  SetPermissionsRequest,
} from '../types/permission';
import { createCrudHooks } from './use-crud';

export function useMyPermissions() {
  return useQuery({
    queryKey: queryKeys.permissions.me,
    queryFn: async () => {
      const res = await permissionService.getMyPermissions();
      return res.data;
    },
  });
}

export function useUserPermissions(userId: string) {
  return useQuery({
    queryKey: queryKeys.permissions.user(userId),
    queryFn: async () => {
      const res = await permissionService.getUserPermissions(userId);
      return res.data;
    },
    enabled: !!userId,
  });
}

export function useCompilePermissions(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId?: number) => {
      if (projectId) {
        await permissionService.compileForProject(userId, projectId);
      } else {
        await permissionService.compile(userId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.user(userId) });
    },
  });
}

export function useExplainPermission() {
  return useMutation({
    mutationFn: async (data: ExplainPermissionRequest) => {
      const res = await permissionService.explain(data);
      return res.data;
    },
  });
}

export const {
  useList: usePermissionTemplateList,
  useById: usePermissionTemplateById,
  useCreate: useCreatePermissionTemplate,
  useUpdate: useUpdatePermissionTemplate,
  useDelete: useDeletePermissionTemplate,
} = createCrudHooks<
  PermissionTemplate,
  CreatePermissionTemplateRequest,
  UpdatePermissionTemplateRequest
>({
  allKey: queryKeys.permissions.templates.all,
  listKey: () => queryKeys.permissions.templates.all,
  byIdKey: queryKeys.permissions.templates.byId,
  listFn: permissionTemplateService.list,
  byIdFn: permissionTemplateService.byId,
  createFn: permissionTemplateService.create,
  updateFn: permissionTemplateService.update,
  deleteFn: permissionTemplateService.delete,
});

export function useTemplatePermissions(templateId: number) {
  return useQuery({
    queryKey: queryKeys.permissions.templates.permissions(templateId),
    queryFn: async () => {
      const res = await permissionService.templates.permissions.list(templateId);
      return res.data;
    },
    enabled: !!templateId,
  });
}

export function useSetTemplatePermissions(templateId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SetPermissionsRequest) => {
      await permissionService.templates.permissions.set(templateId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.permissions.templates.permissions(templateId),
      });
    },
  });
}

export function useRoleProjectPermissions(roleId?: number, projectId?: number) {
  return useQuery({
    queryKey: roleId && projectId
      ? queryKeys.permissions.roleProject.byRoleAndProject(roleId, projectId)
      : roleId
        ? queryKeys.permissions.roleProject.byRole(roleId)
        : queryKeys.permissions.roleProject.all,
    queryFn: async () => {
      if (roleId && projectId) {
        const res = await permissionService.roleProject.byRoleAndProject(roleId, projectId);
        return res.data;
      }
      if (roleId) {
        const res = await permissionService.roleProject.byRole(roleId);
        return res.data;
      }
      const res = await permissionService.roleProject.list();
      return res.data;
    },
    enabled: true,
  });
}

export function useCreateRoleProjectPermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRoleProjectPermissionRequest) => {
      const res = await permissionService.roleProject.create(data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.roleProject.all });
    },
  });
}

export function useDeleteRoleProjectPermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await permissionService.roleProject.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.roleProject.all });
    },
  });
}

export function useUserPermissionOverrides(userId: string, projectId?: number) {
  return useQuery({
    queryKey: projectId
      ? queryKeys.permissions.overrides.byUserAndProject(userId, projectId)
      : queryKeys.permissions.overrides.byUser(userId),
    queryFn: async () => {
      if (projectId) {
        const res = await permissionService.overrides.byUserAndProject(userId, projectId);
        return res.data;
      }
      const res = await permissionService.overrides.byUser(userId);
      return res.data;
    },
    enabled: !!userId,
  });
}

export function useCreatePermissionOverride() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateOverrideRequest) => {
      const res = await permissionService.overrides.create(data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.overrides.byUser('') });
    },
  });
}

export function useDeletePermissionOverride() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await permissionService.overrides.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.overrides.byUser('') });
    },
  });
}
