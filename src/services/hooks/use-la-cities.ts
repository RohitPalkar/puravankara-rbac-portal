import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../api/query-keys';
import { laCityService } from '../services/la-city.service';
import type { PaginationQuery } from '../types/api';

export function useLaCityList(params?: PaginationQuery) {
  return useQuery({
    queryKey: queryKeys.laCities.list(params as Record<string, unknown>),
    queryFn: async () => {
      const res = await laCityService.list(params as any);
      return res.data as any;
    },
  });
}

export function useLaCityById(id: number) {
  return useQuery({
    queryKey: queryKeys.laCities.byId(id),
    queryFn: async () => {
      const res = await laCityService.byId(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateLaCity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await laCityService.create(data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.laCities.all }),
  });
}

export function useUpdateLaCity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await laCityService.update(id, data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.laCities.all }),
  });
}

export function useDeleteLaCity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await laCityService.delete(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.laCities.all }),
  });
}
