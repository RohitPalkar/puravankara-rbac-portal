import { apiGet, apiPost, apiDelete } from '../api/client';
import { createCrudService } from '../api/crud';
import { endpoints } from '../api/endpoints';
import type { ApiResponse, PaginationQuery } from '../types/api';
import type {
  ProjectGroup,
  CreateProjectGroupRequest,
  UpdateProjectGroupRequest,
  AssignProjectAccessRequest,
  AssignBulkProjectAccessRequest,
  AddProjectToGroupRequest,
  AssignUserProjectGroupRequest,
  UserProjectAccess,
  ProjectGroupProject,
  UserProjectGroup,
} from '../types/project-access';

export const projectGroupService = createCrudService<
  ProjectGroup,
  CreateProjectGroupRequest,
  UpdateProjectGroupRequest
>({
  list: endpoints.projectAccess.groups.list,
  byId: endpoints.projectAccess.groups.byId,
  create: endpoints.projectAccess.groups.create,
  update: endpoints.projectAccess.groups.update,
  delete: endpoints.projectAccess.groups.delete,
});

export const projectAccessService = {
  byUser: async (userId: string): Promise<ApiResponse<UserProjectAccess[]>> =>
    apiGet<UserProjectAccess[]>(endpoints.projectAccess.byUser(userId)),

  assign: async (data: AssignProjectAccessRequest): Promise<ApiResponse<void>> =>
    apiPost<void>(endpoints.projectAccess.assign, data),

  assignBulk: async (data: AssignBulkProjectAccessRequest): Promise<ApiResponse<void>> =>
    apiPost<void>(endpoints.projectAccess.assignBulk, data),

  revoke: async (userId: string, projectId: number): Promise<ApiResponse<void>> =>
    apiDelete<void>(endpoints.projectAccess.revoke(userId, projectId)),

  groupProjects: {
    byGroup: async (groupId: number): Promise<ApiResponse<ProjectGroupProject[]>> =>
      apiGet<ProjectGroupProject[]>(endpoints.projectAccess.groups.projects.byGroup(groupId)),

    add: async (data: AddProjectToGroupRequest): Promise<ApiResponse<void>> =>
      apiPost<void>(endpoints.projectAccess.groups.projects.add, data),

    remove: async (groupId: number, projectId: number): Promise<ApiResponse<void>> =>
      apiDelete<void>(endpoints.projectAccess.groups.projects.remove(groupId, projectId)),
  },

  userGroups: {
    byUser: async (userId: string): Promise<ApiResponse<UserProjectGroup[]>> =>
      apiGet<UserProjectGroup[]>(endpoints.projectAccess.userGroups.byUser(userId)),

    assign: async (data: AssignUserProjectGroupRequest): Promise<ApiResponse<void>> =>
      apiPost<void>(endpoints.projectAccess.userGroups.assign, data),

    remove: async (userId: string, groupId: number): Promise<ApiResponse<void>> =>
      apiDelete<void>(endpoints.projectAccess.userGroups.remove(userId, groupId)),
  },
};
