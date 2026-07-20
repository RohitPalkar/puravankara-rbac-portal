import { createCrudService } from '../api/crud';
import { endpoints } from '../api/endpoints';
import type { UserGroup, CreateUserGroupRequest, UpdateUserGroupRequest } from '../types/user-group';

export const userGroupService = createCrudService<UserGroup, CreateUserGroupRequest, UpdateUserGroupRequest>({
  list: endpoints.userGroups.list,
  byId: endpoints.userGroups.byId,
  create: endpoints.userGroups.create,
  update: endpoints.userGroups.update,
  delete: endpoints.userGroups.delete,
});
