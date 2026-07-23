import { apiGet, apiPost, apiPatch, apiDelete } from './client';

import type { ApiResponse, PaginationMeta, PaginationQuery } from '../types/api';

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface CrudEndpoints {
  list: string;
  byId: (id: number) => string;
  create: string;
  update: (id: number) => string;
  delete: (id: number) => string;
}

export async function getList<T>(
  url: string,
  params?: PaginationQuery
): Promise<ApiResponse<T[]>> {
  return apiGet<T[]>(url, params as Record<string, unknown>);
}

export async function getById<T>(
  url: string
): Promise<ApiResponse<T>> {
  return apiGet<T>(url);
}

export async function createEntity<T, R>(
  url: string,
  data: R
): Promise<ApiResponse<T>> {
  return apiPost<T>(url, data);
}

export async function updateEntity<T, R>(
  url: string,
  data: R
): Promise<ApiResponse<T>> {
  return apiPatch<T>(url, data);
}

export async function deleteEntity(
  url: string
): Promise<ApiResponse<void>> {
  return apiDelete<void>(url);
}

export function createCrudService<T, CreateDto, UpdateDto = Partial<CreateDto>>(
  endpoints: CrudEndpoints
) {
  return {
    list: (params?: PaginationQuery) =>
      getList<T>(endpoints.list, params),

    byId: (id: number) =>
      getById<T>(endpoints.byId(id)),

    create: (data: CreateDto) =>
      createEntity<T, CreateDto>(endpoints.create, data),

    update: (id: number, data: UpdateDto) =>
      updateEntity<T, UpdateDto>(endpoints.update(id), data),

    delete: (id: number) =>
      deleteEntity(endpoints.delete(id)),
  };
}
