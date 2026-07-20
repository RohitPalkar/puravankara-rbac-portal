import type { ApiResponse, PaginationMeta } from '../types/api';

export function extractData<T>(response: ApiResponse<T>): T {
  return response.data;
}

export function extractMeta(response: ApiResponse<unknown>): PaginationMeta | undefined {
  return response.meta;
}

export function isPaginated<T>(
  data: T | T[]
): data is T[] {
  return Array.isArray(data);
}
