import { createCrudService } from '../api/crud';
import { endpoints } from '../api/endpoints';
import type {
  Delegation,
  CreateDelegationRequest,
  UpdateDelegationRequest,
} from '../types/delegation';

export const delegationService = createCrudService<
  Delegation,
  CreateDelegationRequest,
  UpdateDelegationRequest
>({
  list: endpoints.delegations.list,
  byId: endpoints.delegations.byId,
  create: endpoints.delegations.create,
  update: endpoints.delegations.update,
  delete: endpoints.delegations.delete,
});
