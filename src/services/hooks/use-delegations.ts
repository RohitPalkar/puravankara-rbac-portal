import { queryKeys } from '../api/query-keys';
import { delegationService } from '../services/delegation.service';
import type { Delegation, CreateDelegationRequest, UpdateDelegationRequest } from '../types/delegation';
import { createCrudHooks } from './use-crud';

export const {
  useList: useDelegationList,
  useById: useDelegationById,
  useCreate: useCreateDelegation,
  useUpdate: useUpdateDelegation,
  useDelete: useDeleteDelegation,
} = createCrudHooks<Delegation, CreateDelegationRequest, UpdateDelegationRequest>({
  allKey: queryKeys.delegations.all,
  listKey: queryKeys.delegations.list,
  byIdKey: queryKeys.delegations.byId,
  listFn: delegationService.list,
  byIdFn: delegationService.byId,
  createFn: delegationService.create,
  updateFn: delegationService.update,
  deleteFn: delegationService.delete,
});
