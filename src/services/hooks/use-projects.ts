import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { createCrudHooks } from './use-crud';
import { queryKeys } from '../api/query-keys';
import { projectService } from '../services/project.service';

import type { Project, CreateProjectRequest, UpdateProjectRequest, CreateProjectLocationRequest } from '../types/project';

export const {
  useList: useProjectList,
  useById: useProjectById,
  useCreate: useCreateProject,
  useUpdate: useUpdateProject,
  useDelete: useDeleteProject,
} = createCrudHooks<Project, CreateProjectRequest, UpdateProjectRequest>({
  allKey: queryKeys.projects.all,
  listKey: queryKeys.projects.list,
  byIdKey: queryKeys.projects.byId,
  listFn: projectService.list,
  byIdFn: projectService.byId,
  createFn: projectService.create,
  updateFn: projectService.update,
  deleteFn: projectService.delete,
});

export function useProjectLocationList(projectId?: number) {
  return useQuery({
    queryKey: projectId
      ? queryKeys.projects.locations.byProject(projectId)
      : queryKeys.projects.locations.all,
    queryFn: async () => {
      const res = projectId
        ? await projectService.locations.byProject(projectId)
        : await projectService.locations.list();
      return res.data;
    },
  });
}

export function useProjectLocationsByZone(zoneId: number) {
  return useQuery({
    queryKey: queryKeys.projects.locations.byZone(zoneId),
    queryFn: async () => {
      const res = await projectService.locations.byZone(zoneId);
      return res.data;
    },
    enabled: !!zoneId,
  });
}

export function useCreateProjectLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProjectLocationRequest) => {
      const res = await projectService.locations.create(data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.locations.all });
    },
  });
}

export function useDeleteProjectLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      cityId,
      zoneId,
    }: {
      projectId: number;
      cityId: number;
      zoneId: number;
    }) => {
      await projectService.locations.delete(projectId, cityId, zoneId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.locations.all });
    },
  });
}
