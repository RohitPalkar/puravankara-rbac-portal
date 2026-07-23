import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createCrudHooks } from './use-crud';
import { queryKeys } from '../api/query-keys';
import { phaseService } from '../services/phase.service';

import type { Phase, CreatePhaseRequest, UpdatePhaseRequest, UpdateLaunchRequest } from '../types/phase';

export const {
  useList: usePhaseList,
  useById: usePhaseById,
  useCreate: useCreatePhase,
  useUpdate: useUpdatePhase,
  useDelete: useDeletePhase,
} = createCrudHooks<Phase, CreatePhaseRequest, UpdatePhaseRequest>({
  allKey: queryKeys.phases.all,
  listKey: queryKeys.phases.list,
  byIdKey: queryKeys.phases.byId,
  listFn: phaseService.list,
  byIdFn: phaseService.byId,
  createFn: phaseService.create,
  updateFn: phaseService.update,
  deleteFn: phaseService.delete,
});

export function useUpdateLaunch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateLaunchRequest }) => {
      const res = await phaseService.updateLaunch(id, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.phases.all });
    },
  });
}
