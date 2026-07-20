import type { QueryKey } from '@tanstack/react-query';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import type { PaginationQuery } from '../types/api';

interface CrudHooksOptions<T, CreateDto, UpdateDto> {
  allKey: QueryKey;
  listKey: (params?: Record<string, unknown>) => QueryKey;
  byIdKey: (id: number) => QueryKey;
  listFn: (params?: PaginationQuery) => Promise<{ data: T[] }>;
  byIdFn: (id: number) => Promise<{ data: T }>;
  createFn: (data: CreateDto) => Promise<{ data: T }>;
  updateFn: (id: number, data: UpdateDto) => Promise<{ data: T }>;
  deleteFn: (id: number) => Promise<{ data: void }>;
}

export function createCrudHooks<T, CreateDto, UpdateDto = Partial<CreateDto>>(
  opts: CrudHooksOptions<T, CreateDto, UpdateDto>
) {
  function useList(params?: PaginationQuery) {
    return useQuery({
      queryKey: opts.listKey(params as Record<string, unknown>),
      queryFn: async () => {
        const res = await opts.listFn(params);
        return res.data;
      },
    });
  }

  function useById(id: number) {
    return useQuery({
      queryKey: opts.byIdKey(id),
      queryFn: async () => {
        const res = await opts.byIdFn(id);
        return res.data;
      },
      enabled: !!id,
    });
  }

  function useCreate() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async (data: CreateDto) => {
        const res = await opts.createFn(data);
        return res.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: opts.allKey });
      },
    });
  }

  function useUpdate() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async ({ id, data }: { id: number; data: UpdateDto }) => {
        const res = await opts.updateFn(id, data);
        return res.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: opts.allKey });
      },
    });
  }

  function useDelete() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async (id: number) => {
        await opts.deleteFn(id);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: opts.allKey });
      },
    });
  }

  return { useList, useById, useCreate, useUpdate, useDelete };
}
