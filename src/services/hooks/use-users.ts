import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '../api/query-keys';
import { userService } from '../services/user.service';

import type { PaginationQuery } from '../types/api';
import type {
  CreateUserRequest,
  UpdateUserRequest,
  CreateUserRoleRequest,
  CreateUserFullRequest,
  CreateUserReportingLineRequest,
} from '../types/user';

export function useUserList(params?: PaginationQuery) {
  return useQuery({
    queryKey: queryKeys.users.list(params as Record<string, unknown>),
    queryFn: async () => {
      const res = await userService.list(params);
      return res.data;
    },
  });
}

export function useUserById(id: string) {
  return useQuery({
    queryKey: queryKeys.users.byId(id),
    queryFn: async () => {
      const res = await userService.byId(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserRequest) => {
      const res = await userService.create(data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useCreateUserFull() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserFullRequest) => {
      const res = await userService.createFull(data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export type CreateUserFullResult = Awaited<ReturnType<ReturnType<typeof useCreateUserFull>['mutateAsync']>>;

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserRequest }) => {
      const res = await userService.update(id, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await userService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useFetchEmployee() {
  return useMutation({
    mutationFn: async (employeeId: string) => {
      const res = await userService.fetchEmployee(employeeId);
      return res.data;
    },
  });
}

export function useUserRoles(userId: string) {
  return useQuery({
    queryKey: queryKeys.users.roles(userId),
    queryFn: async () => {
      const res = await userService.roles.byUser(userId);
      return res.data;
    },
    enabled: !!userId,
  });
}

export function useCreateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserRoleRequest) => {
      const res = await userService.roles.create(data);
      return res.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.roles(variables.userId) });
    },
  });
}

export function useDeleteUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      departmentId,
      roleId,
    }: {
      userId: string;
      departmentId: number;
      roleId: number;
    }) => {
      await userService.roles.delete(userId, departmentId, roleId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.roles(variables.userId) });
    },
  });
}

export function useUserReportingLines(userId: string) {
  return useQuery({
    queryKey: queryKeys.users.reportingLines(userId),
    queryFn: async () => {
      const res = await userService.reportingLines.byUser(userId);
      return res.data;
    },
    enabled: !!userId,
  });
}

export function useCreateUserReportingLine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserReportingLineRequest) => {
      const res = await userService.reportingLines.create(data);
      return res.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.reportingLines(variables.userId),
      });
    },
  });
}

export function useDeleteUserReportingLine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      reportsToUserId,
      levelRank,
    }: {
      userId: string;
      reportsToUserId: string;
      levelRank: number;
    }) => {
      await userService.reportingLines.delete(userId, reportsToUserId, levelRank);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.reportingLines(variables.userId),
      });
    },
  });
}

export function useUserZones(userId: string) {
  return useQuery({
    queryKey: queryKeys.users.zones(userId),
    queryFn: async () => {
      const res = await userService.zones.byUser(userId);
      return res.data;
    },
    enabled: !!userId,
  });
}

export function useAssignUserZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, zoneId }: { userId: string; zoneId: number }) => {
      const res = await userService.zones.assign(userId, zoneId);
      return res.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.zones(variables.userId),
      });
    },
  });
}

export function useRevokeUserZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, zoneId }: { userId: string; zoneId: number }) => {
      await userService.zones.revoke(userId, zoneId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.zones(variables.userId),
      });
    },
  });
}
