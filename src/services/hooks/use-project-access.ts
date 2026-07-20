import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '../api/query-keys';
import { projectGroupService, projectAccessService } from '../services/project-access.service';
import type {
  ProjectGroup,
  CreateProjectGroupRequest,
  UpdateProjectGroupRequest,
  AssignProjectAccessRequest,
  AssignBulkProjectAccessRequest,
  AddProjectToGroupRequest,
  AssignUserProjectGroupRequest,
} from '../types/project-access';
import { createCrudHooks } from './use-crud';

export const {
  useList: useProjectGroupList,
  useById: useProjectGroupById,
  useCreate: useCreateProjectGroup,
  useUpdate: useUpdateProjectGroup,
  useDelete: useDeleteProjectGroup,
} = createCrudHooks<ProjectGroup, CreateProjectGroupRequest, UpdateProjectGroupRequest>({
  allKey: queryKeys.projectAccess.groups.all,
  listKey: queryKeys.projectAccess.groups.list,
  byIdKey: queryKeys.projectAccess.groups.byId,
  listFn: projectGroupService.list,
  byIdFn: projectGroupService.byId,
  createFn: projectGroupService.create,
  updateFn: projectGroupService.update,
  deleteFn: projectGroupService.delete,
});

export function useUserProjectAccess(userId: string) {
  return useQuery({
    queryKey: queryKeys.projectAccess.byUser(userId),
    queryFn: async () => {
      const res = await projectAccessService.byUser(userId);
      return res.data;
    },
    enabled: !!userId,
  });
}

export function useAssignProjectAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AssignProjectAccessRequest) => {
      await projectAccessService.assign(data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projectAccess.byUser(variables.userId),
      });
    },
  });
}

export function useAssignBulkProjectAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AssignBulkProjectAccessRequest) => {
      await projectAccessService.assignBulk(data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projectAccess.byUser(variables.userId),
      });
    },
  });
}

export function useRevokeProjectAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, projectId }: { userId: string; projectId: number }) => {
      await projectAccessService.revoke(userId, projectId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projectAccess.byUser(variables.userId),
      });
    },
  });
}

export function useGroupProjects(groupId: number) {
  return useQuery({
    queryKey: queryKeys.projectAccess.groups.projects(groupId),
    queryFn: async () => {
      const res = await projectAccessService.groupProjects.byGroup(groupId);
      return res.data;
    },
    enabled: !!groupId,
  });
}

export function useAddProjectToGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AddProjectToGroupRequest) => {
      await projectAccessService.groupProjects.add(data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projectAccess.groups.projects(variables.groupId),
      });
    },
  });
}

export function useRemoveProjectFromGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, projectId }: { groupId: number; projectId: number }) => {
      await projectAccessService.groupProjects.remove(groupId, projectId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projectAccess.groups.projects(variables.groupId),
      });
    },
  });
}

export function useUserProjectGroups(userId: string) {
  return useQuery({
    queryKey: queryKeys.projectAccess.userGroups.byUser(userId),
    queryFn: async () => {
      const res = await projectAccessService.userGroups.byUser(userId);
      return res.data;
    },
    enabled: !!userId,
  });
}

export function useAssignUserProjectGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AssignUserProjectGroupRequest) => {
      await projectAccessService.userGroups.assign(data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projectAccess.userGroups.byUser(variables.userId),
      });
    },
  });
}

export function useRemoveUserProjectGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, groupId }: { userId: string; groupId: number }) => {
      await projectAccessService.userGroups.remove(userId, groupId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projectAccess.userGroups.byUser(variables.userId),
      });
    },
  });
}
