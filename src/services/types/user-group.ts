import { AppBase } from './common';

export interface UserGroup extends AppBase {
  name: string;
  description?: string;
  isActive: boolean;
}

export interface CreateUserGroupRequest {
  name: string;
  description?: string;
  isActive?: boolean;
}

export type UpdateUserGroupRequest = Partial<CreateUserGroupRequest>;
