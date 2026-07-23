import { endpoints } from '../api/endpoints';
import { apiGet, apiPost } from '../api/client';

import type { ApiResponse } from '../types/api';
import type { SetupStatus } from '../types/setup';

export const setupService = {
  status: async (): Promise<ApiResponse<SetupStatus>> =>
    apiGet<SetupStatus>(endpoints.setup.status),

  reset: async (): Promise<ApiResponse<void>> =>
    apiPost<void>(endpoints.setup.reset),
};
