import api from './axios'
import type { ApiResponse, LoginPayload, User, PermissionTree } from '@/types/api.types'

export const auth = {
  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<LoginPayload>>('/auth/login', data).then((r) => r.data.data),

  me: () =>
    api.get<ApiResponse<User>>('/auth/me').then((r) => r.data.data),

  refresh: (refreshToken: string) =>
    api.post<ApiResponse<{ accessToken: string; refreshToken: string }>>('/auth/refresh', { refreshToken })
      .then((r) => r.data.data),

  logout: () =>
    api.post<ApiResponse<null>>('/auth/logout').then((r) => r.data),
}

export const permissions = {
  me: () =>
    api.get<ApiResponse<PermissionTree>>('/permissions/me').then((r) => r.data.data),
}

export const users = {
  list: (params?: Record<string, unknown>) =>
    api.get('/users', { params }).then((r) => r.data.data),
  byId: (id: string) =>
    api.get(`/users/${id}`).then((r) => r.data.data),
  create: (data: Record<string, unknown>) =>
    api.post('/users', data).then((r) => r.data.data),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/users/${id}`, data).then((r) => r.data.data),
  delete: (id: string) =>
    api.delete(`/users/${id}`).then((r) => r.data.data),
}

export const zones = {
  list: (params?: Record<string, unknown>) =>
    api.get('/zones', { params }).then((r) => r.data.data),
  byId: (id: string) =>
    api.get(`/zones/${id}`).then((r) => r.data.data),
  create: (data: Record<string, unknown>) =>
    api.post('/zones', data).then((r) => r.data.data),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/zones/${id}`, data).then((r) => r.data.data),
  delete: (id: string) =>
    api.delete(`/zones/${id}`).then((r) => r.data.data),
}

export const cities = {
  list: (params?: Record<string, unknown>) =>
    api.get('/cities', { params }).then((r) => r.data.data),
  byId: (id: string) =>
    api.get(`/cities/${id}`).then((r) => r.data.data),
}

export const cityZoneMappings = {
  list: (params?: Record<string, unknown>) =>
    api.get('/city-zone-mappings', { params }).then((r) => r.data.data),
  create: (data: Record<string, unknown>) =>
    api.post('/city-zone-mappings', data).then((r) => r.data.data),
  delete: (id: string) =>
    api.delete(`/city-zone-mappings/${id}`).then((r) => r.data.data),
  deleteByZoneAndCity: (zoneId: string, cityId: string) =>
    api.delete('/city-zone-mappings', { data: { zoneId, cityId } }).then((r) => r.data),
}

export const departments = {
  list: (params?: Record<string, unknown>) =>
    api.get('/departments', { params }).then((r) => r.data.data),
  byId: (id: string) =>
    api.get(`/departments/${id}`).then((r) => r.data.data),
  create: (data: Record<string, unknown>) =>
    api.post('/departments', data).then((r) => r.data.data),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/departments/${id}`, data).then((r) => r.data.data),
  delete: (id: string) =>
    api.delete(`/departments/${id}`).then((r) => r.data.data),
}

export const roles = {
  list: (params?: Record<string, unknown>) =>
    api.get('/roles', { params }).then((r) => r.data.data),
  byId: (id: string) =>
    api.get(`/roles/${id}`).then((r) => r.data.data),
  create: (data: Record<string, unknown>) =>
    api.post('/roles', data).then((r) => r.data.data),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/roles/${id}`, data).then((r) => r.data.data),
  delete: (id: string) =>
    api.delete(`/roles/${id}`).then((r) => r.data.data),
}

export const departmentRoles = {
  list: (params?: Record<string, unknown>) =>
    api.get('/department-roles', { params }).then((r) => r.data.data),
}

export const projects = {
  list: () => api.get('/projects').then((r) => r.data.data),
}

export const modules = {
  list: (params?: Record<string, unknown>) =>
    api.get('/modules', { params }).then((r) => r.data.data),
  byId: (id: string) =>
    api.get(`/modules/${id}`).then((r) => r.data.data),
  create: (data: Record<string, unknown>) =>
    api.post('/modules', data).then((r) => r.data.data),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/modules/${id}`, data).then((r) => r.data.data),
  delete: (id: string) =>
    api.delete(`/modules/${id}`).then((r) => r.data.data),
}

export const subModules = {
  list: (params?: Record<string, unknown>) =>
    api.get('/sub-modules', { params }).then((r) => r.data.data),
  byId: (id: string) =>
    api.get(`/sub-modules/${id}`).then((r) => r.data.data),
  create: (data: Record<string, unknown>) =>
    api.post('/sub-modules', data).then((r) => r.data.data),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/sub-modules/${id}`, data).then((r) => r.data.data),
  delete: (id: string) =>
    api.delete(`/sub-modules/${id}`).then((r) => r.data.data),
}

export const actions = {
  list: (params?: Record<string, unknown>) =>
    api.get('/actions', { params }).then((r) => r.data.data),
  byId: (id: string) =>
    api.get(`/actions/${id}`).then((r) => r.data.data),
  create: (data: Record<string, unknown>) =>
    api.post('/actions', data).then((r) => r.data.data),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/actions/${id}`, data).then((r) => r.data.data),
  delete: (id: string) =>
    api.delete(`/actions/${id}`).then((r) => r.data.data),
}

export const setup = {
  status: () => api.get('/setup/status').then((r) => r.data.data),
  reset: () => api.post('/setup/reset').then((r) => r.data.data),
}

export const audit = {
  list: (params?: Record<string, unknown>) =>
    api.get('/audit/logs', { params }).then((r) => r.data.data),
}
