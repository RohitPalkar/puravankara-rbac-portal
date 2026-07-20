import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '../api/query-keys';
import { setupService } from '../services/setup.service';

export function useSetupStatus() {
  return useQuery({
    queryKey: queryKeys.setup.status,
    queryFn: async () => {
      const res = await setupService.status();
      return res.data;
    },
  });
}

export function useResetSetup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await setupService.reset();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.setup.status });
    },
  });
}
