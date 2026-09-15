import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../api/query-keys';
import { landConsultantService } from '../services/land-consultant.service';
import type {
  LandConsultant,
  CreateLandConsultantRequest,
  UpdateLandConsultantRequest,
} from '../services/land-consultant.service';
import type { PaginationQuery } from '../types/api';

export function useLandConsultantList(params?: PaginationQuery) {
  return useQuery({
    queryKey: queryKeys.landConsultants.list(params as Record<string, unknown>),
    queryFn: async () => {
      const res = await landConsultantService.list(params as any);
      return res.data as any;
    },
  });
}

export function useLandConsultantById(id: number) {
  return useQuery({
    queryKey: queryKeys.landConsultants.byId(id),
    queryFn: async () => {
      const res = await landConsultantService.byId(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateLandConsultant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateLandConsultantRequest) => {
      const res = await landConsultantService.create(data as any);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.landConsultants.all }),
  });
}

export function useUpdateLandConsultant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateLandConsultantRequest }) => {
      const res = await landConsultantService.update(id, data as any);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.landConsultants.all }),
  });
}

export function useDeleteLandConsultant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await landConsultantService.delete(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.landConsultants.all }),
  });
}
