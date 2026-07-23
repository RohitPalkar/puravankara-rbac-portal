import { apiPut } from '../api/client';
import { endpoints } from '../api/endpoints';
import { createCrudService } from '../api/crud';

import type { ApiResponse } from '../types/api';
import type {
  Phase,
  CreatePhaseRequest,
  UpdatePhaseRequest,
  UpdateLaunchRequest,
} from '../types/phase';

export const phaseService = {
  ...createCrudService<Phase, CreatePhaseRequest, UpdatePhaseRequest>({
    list: endpoints.phases.list,
    byId: endpoints.phases.byId,
    create: endpoints.phases.create,
    update: endpoints.phases.update,
    delete: endpoints.phases.delete,
  }),

  updateLaunch: async (id: number, data: UpdateLaunchRequest): Promise<ApiResponse<Phase>> =>
    apiPut<Phase>(endpoints.phases.launch(id), data),
};
