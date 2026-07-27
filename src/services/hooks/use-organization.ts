import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { createCrudHooks } from './use-crud';
import { queryKeys } from '../api/query-keys';
import { roleService, departmentService, roleMigrationService, levelMigrationService, departmentRoleService } from '../services/organization.service';

import type {
  Role,
  Department,
  DepartmentDetail,
  CreateRoleRequest,
  UpdateRoleRequest,
  DepartmentListItem,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  LevelImpactPreview,
  RemoveLevelResult,
  AutoMergeResult,
} from '../types/organization';

export const {
  useList: useDepartmentList,
  useById: useDepartmentById,
  useCreate: useCreateDepartment,
  useUpdate: useUpdateDepartment,
  useDelete: useDeleteDepartment,
} = createCrudHooks<Department, CreateDepartmentRequest, UpdateDepartmentRequest>({
  allKey: queryKeys.departments.all,
  listKey: queryKeys.departments.list,
  byIdKey: queryKeys.departments.byId,
  listFn: departmentService.list,
  byIdFn: departmentService.byId,
  createFn: departmentService.create,
  updateFn: departmentService.update,
  deleteFn: departmentService.delete,
});

export function useDepartmentHierarchyLevels(departmentId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.departments.hierarchyLevels(departmentId!),
    queryFn: async () => {
      const res = await departmentService.hierarchyLevels(departmentId!);
      return res.data as { id: number; levelNumber: number; roleName: string; displayOrder: number }[];
    },
    enabled: !!departmentId,
  });
}

export function useRoleForHierarchy(departmentId: number | undefined, levelNumber: number | undefined) {
  return useQuery({
    queryKey: [...queryKeys.departments.hierarchyLevels(departmentId!), String(levelNumber)],
    queryFn: async () => {
      const res = await departmentService.roleForHierarchy(departmentId!, levelNumber!);
      return res.data;
    },
    enabled: !!departmentId && !!levelNumber,
  });
}

export function useDepartmentListV2(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [...queryKeys.departments.list(params)],
    queryFn: async () => {
      const res = await departmentService.list(params as any);
      return { data: res.data as unknown as DepartmentListItem[], meta: res.meta };
    },
  });
}

export function useDepartmentByIdV2(id: number) {
  return useQuery({
    queryKey: queryKeys.departments.byId(id),
    queryFn: async () => {
      const res = await departmentService.byId(id);
      return res.data as unknown as DepartmentDetail;
    },
    enabled: !!id,
  });
}

export const {
  useList: useRoleList,
  useById: useRoleById,
  useCreate: useCreateRole,
  useUpdate: useUpdateRole,
  useDelete: useDeleteRole,
} = createCrudHooks<Role, CreateRoleRequest, UpdateRoleRequest>({
  allKey: queryKeys.roles.all,
  listKey: queryKeys.roles.list,
  byIdKey: queryKeys.roles.byId,
  listFn: roleService.list,
  byIdFn: roleService.byId,
  createFn: roleService.create,
  updateFn: roleService.update,
  deleteFn: roleService.delete,
});

export function useDepartmentRoleList() {
  return useQuery({
    queryKey: queryKeys.departmentRoles.all,
    queryFn: async () => {
      const res = await departmentRoleService.list();
      return res.data;
    },
  });
}

export function useCreateDepartmentRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      departmentId,
      roleId,
    }: {
      departmentId: number;
      roleId: number;
    }) => {
      const res = await departmentRoleService.create(departmentId, roleId);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departmentRoles.all });
    },
  });
}

export function useRemoveRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: { mode: 'MERGE' | 'REPLACE'; destinationRoleId: number };
    }) => {
      const { data } = await roleMigrationService.remove(id, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
    },
  });
}

export function useRemoveRoleCheck(id: number | null) {
  return useQuery({
    queryKey: ['roles', id, 'remove-check'],
    queryFn: async () => {
      const res = await roleMigrationService.checkRemove(id!);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useRemoveRoleDependencies(id: number | null) {
  return useQuery({
    queryKey: ['roles', id, 'remove-dependencies'],
    queryFn: async () => {
      const res = await roleMigrationService.getDependencies(id!);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useLevelImpact(departmentId: number | undefined, levelNumber: number | undefined) {
  return useQuery({
    queryKey: queryKeys.departments.levelImpact(departmentId!, levelNumber!),
    queryFn: async () => {
      const res = await levelMigrationService.getImpact(departmentId!, levelNumber!);
      return res.data as LevelImpactPreview;
    },
    enabled: !!departmentId && !!levelNumber,
  });
}

export function useLevelRemoveCheck(departmentId: number | undefined, levelNumber: number | undefined) {
  return useQuery({
    queryKey: queryKeys.departments.levelRemove(departmentId!, levelNumber!),
    queryFn: async () => {
      const res = await levelMigrationService.checkRemove(departmentId!, levelNumber!);
      return res.data as AutoMergeResult;
    },
    enabled: !!departmentId && !!levelNumber,
  });
}

export function useLevelRemove() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      departmentId,
      levelNumber,
      payload,
    }: {
      departmentId: number;
      levelNumber: number;
      payload: { mode: 'MERGE' | 'REPLACE'; destinationLevelNumber?: number };
    }) => {
      const res = await levelMigrationService.remove(departmentId, levelNumber, payload);
      return res.data as RemoveLevelResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.all });
    },
  });
}

export function useDeleteDepartmentRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      departmentId,
      roleId,
    }: {
      departmentId: number;
      roleId: number;
    }) => {
      await departmentRoleService.delete(departmentId, roleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departmentRoles.all });
    },
  });
}
