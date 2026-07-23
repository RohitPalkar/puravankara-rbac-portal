import { endpoints } from '../api/endpoints';
import { apiPost, apiDelete } from '../api/client';
import { getList, createCrudService } from '../api/crud';

import type { ApiResponse } from '../types/api';
import type {
  Project,
  ProjectLocation,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateProjectLocationRequest,
} from '../types/project';

export const projectService = {
  ...createCrudService<Project, CreateProjectRequest, UpdateProjectRequest>({
    list: endpoints.projects.list,
    byId: endpoints.projects.byId,
    create: endpoints.projects.create,
    update: endpoints.projects.update,
    delete: endpoints.projects.delete,
  }),

  locations: {
    list: async (): Promise<ApiResponse<ProjectLocation[]>> =>
      getList<ProjectLocation>(endpoints.projects.locations.list),

    byProject: async (projectId: number): Promise<ApiResponse<ProjectLocation[]>> =>
      getList<ProjectLocation>(endpoints.projects.locations.byProject(projectId)),

    byZone: async (zoneId: number): Promise<ApiResponse<ProjectLocation[]>> =>
      getList<ProjectLocation>(endpoints.projects.locations.byZone(zoneId)),

    create: async (data: CreateProjectLocationRequest): Promise<ApiResponse<ProjectLocation>> =>
      apiPost<ProjectLocation>(endpoints.projects.locations.create, data),

    delete: async (projectId: number, cityId: number, zoneId: number): Promise<ApiResponse<void>> =>
      apiDelete<void>(endpoints.projects.locations.delete(projectId, cityId, zoneId)),
  },
};
