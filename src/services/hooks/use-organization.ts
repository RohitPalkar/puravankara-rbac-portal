import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '../api/query-keys';
import { departmentService, roleService, departmentRoleService } from '../services/organization.service';
import type {
  Department,
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
