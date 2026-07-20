import { queryKeys } from '../api/query-keys';
import { userGroupService } from '../services/user-group.service';
import type { UserGroup, CreateUserGroupRequest, UpdateUserGroupRequest } from '../types/user-group';
import { createCrudHooks } from './use-crud';

export const {
  useList: useUserGroupList,
  useById: useUserGroupById,
  useCreate: useCreateUserGroup,
  useUpdate: useUpdateUserGroup,
  useDelete: useDeleteUserGroup,
} = createCrudHooks<UserGroup, CreateUserGroupRequest, UpdateUserGroupRequest>({
  allKey: queryKeys.userGroups.all,
  listKey: queryKeys.userGroups.list,
  byIdKey: queryKeys.userGroups.byId,
  listFn: userGroupService.list,
  byIdFn: userGroupService.byId,
  createFn: userGroupService.create,
  updateFn: userGroupService.update,
  deleteFn: userGroupService.delete,
});
