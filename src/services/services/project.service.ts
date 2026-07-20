import { apiPost, apiPatch, apiDelete } from '../api/client';
import { createCrudService, getList, getById, createEntity } from '../api/crud';
import { endpoints } from '../api/endpoints';
import type { ApiResponse, PaginationQuery } from '../types/api';
import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectLocation,
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
