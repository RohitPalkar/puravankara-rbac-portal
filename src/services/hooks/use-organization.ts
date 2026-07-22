import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '../api/query-keys';
import { departmentService, roleService, departmentRoleService } from '../services/organization.service';
import type {
  Department,
  DepartmentListItem,
  DepartmentDetail,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
} from '../types/organization';
import { createCrudHooks } from './use-crud';

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
