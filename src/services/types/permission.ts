import type { AppBase } from './common';
import type { PermissionType } from './enums';

export interface PermissionTemplate extends AppBase {
  name: string;
  description?: string;
  isActive: boolean;
}

export interface CreatePermissionTemplateRequest {
  name: string;
  description?: string;
}

export type UpdatePermissionTemplateRequest = Partial<{
  name: string;
  description?: string;
  isActive: boolean;
}>;

export interface RoleProjectPermission extends AppBase {
  roleId: number;
  roleName?: string;
  projectId: number;
  projectName?: string;
  moduleId: number;
  moduleName?: string;
  subModuleId?: number;
  subModuleName?: string;
  actionId: number;
  actionCode?: string;
  actionLabel?: string;
}

export interface CreateRoleProjectPermissionRequest {
  roleId: number;
  projectId: number;
  moduleId: number;
  subModuleId?: number;
  actionId: number;
}

export interface UserPermissionOverride extends AppBase {
  userId: string;
  userName?: string;
  projectId: number;
  projectName?: string;
  moduleId: number;
  moduleName?: string;
  subModuleId?: number;
  subModuleName?: string;
  actionId: number;
  actionCode?: string;
  permissionType: PermissionType;
  reason?: string;
}

export interface CreateOverrideRequest {
  userId: string;
  projectId: number;
  moduleId: number;
  subModuleId?: number;
  actionId: number;
  permissionType: PermissionType;
  reason?: string;
}

export interface ExplainPermissionRequest {
  userId: string;
  projectId: number;
  module: string;
  action: string;
}

export interface ExplainPermissionResponse {
  allowed: boolean;
  source: string;
  explanation: { step: string; result: boolean; message: string }[];
}

export interface FlatModule {
  id: number;
  moduleId: number;
  moduleName: string;
  subModuleId?: number;
  subModuleName?: string;
  actionId: number;
  actionCode: string;
  actionLabel: string;
  allowed: boolean;
}

export interface UserPermissionsResponse {
  userId: string;
  userName: string;
  permissions: FlatModule[];
}

export interface SetPermissionsRequest {
  permissions: {
    moduleId: number;
    subModuleId?: number;
    actionId: number;
  }[];
}
