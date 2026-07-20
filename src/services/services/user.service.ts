import { apiGet, apiPost, apiPatch, apiDelete } from '../api/client';
import { endpoints } from '../api/endpoints';
import type { ApiResponse, PaginationQuery } from '../types/api';
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  CreateUserRoleRequest,
  UserRole,
  CreateUserReportingLineRequest,
  UserReportingLine,
  UserZone,
  CreateUserFullRequest,
} from '../types/user';

export const userService = {
  list: async (params?: PaginationQuery): Promise<ApiResponse<User[]>> =>
    apiGet<User[]>(endpoints.users.list, params as Record<string, unknown>),

  byId: async (id: string): Promise<ApiResponse<User>> =>
    apiGet<User>(endpoints.users.byId(id)),

  create: async (data: CreateUserRequest): Promise<ApiResponse<User>> =>
    apiPost<User>(endpoints.users.create, data),

  createFull: async (data: CreateUserFullRequest): Promise<ApiResponse<User>> =>
    apiPost<User>(endpoints.users.createFull, data),

  update: async (id: string, data: UpdateUserRequest): Promise<ApiResponse<User>> =>
    apiPatch<User>(endpoints.users.update(id), data),

  delete: async (id: string): Promise<ApiResponse<void>> =>
    apiDelete<void>(endpoints.users.delete(id)),

  fetchEmployee: async (employeeId: string): Promise<ApiResponse<Record<string, unknown>>> =>
    apiPost<Record<string, unknown>>(endpoints.users.fetchEmployee, { employeeId }),

  roles: {
    byUser: async (userId: string): Promise<ApiResponse<UserRole[]>> =>
      apiGet<UserRole[]>(endpoints.users.roles.byUser(userId)),

    create: async (data: CreateUserRoleRequest): Promise<ApiResponse<UserRole>> =>
      apiPost<UserRole>(endpoints.users.roles.create, data),

    delete: async (userId: string, departmentId: number, roleId: number): Promise<ApiResponse<void>> =>
      apiDelete<void>(endpoints.users.roles.delete(userId, departmentId, roleId)),
  },

  reportingLines: {
    byUser: async (userId: string): Promise<ApiResponse<UserReportingLine[]>> =>
      apiGet<UserReportingLine[]>(endpoints.users.reportingLines.byUser(userId)),

    create: async (data: CreateUserReportingLineRequest): Promise<ApiResponse<UserReportingLine>> =>
      apiPost<UserReportingLine>(endpoints.users.reportingLines.create, data),

    delete: async (
      userId: string,
      reportsToUserId: string,
      levelRank: number
    ): Promise<ApiResponse<void>> =>
      apiDelete<void>(endpoints.users.reportingLines.delete(userId, reportsToUserId, levelRank)),
  },

  zones: {
    byUser: async (userId: string): Promise<ApiResponse<UserZone[]>> =>
      apiGet<UserZone[]>(endpoints.users.zones.byUser(userId)),

    assign: async (userId: string, zoneId: number): Promise<ApiResponse<UserZone>> =>
      apiPost<UserZone>(endpoints.users.zones.assign, { userId, zoneId }),

    revoke: async (userId: string, zoneId: number): Promise<ApiResponse<void>> =>
      apiDelete<void>(endpoints.users.zones.revoke(userId, zoneId)),
  },
};
