export type Status = 'active' | 'inactive';

export interface Zone {
  id: string;
  name: string;
  code: string;
  status: Status;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface City {
  id: string;
  name: string;
  code: string;
  zoneId: string;
  zoneName?: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  maxHierarchyLevels: number;
  createdBy: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  code: string;
  description: string;
  departmentId: string;
  departmentName?: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export interface Module {
  id: string;
  name: string;
  code: string;
  icon: string;
  sortOrder: number;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export interface SubModule {
  id: string;
  name: string;
  code: string;
  moduleId: string;
  moduleName?: string;
  icon: string;
  sortOrder: number;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export interface Action {
  id: string;
  name: string;
  code: string;
  subModuleId: string;
  subModuleName?: string;
  sortOrder: number;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  departmentId: string;
  departmentName?: string;
  roleId: string;
  roleName?: string;
  status: Status;
  projects?: UserProject[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProject {
  projectId: string;
  projectName?: string;
}

export interface RoleModuleMapping {
  id: string;
  roleId: string;
  moduleId: string;
  moduleName?: string;
  subModuleIds: string[];
  actionIds: string[];
}

export interface UserProjectMapping {
  id: string;
  userId: string;
  projectId: string;
  projectName?: string;
  moduleOverrides: ModuleOverride[];
}

export interface ModuleOverride {
  moduleId: string;
  moduleName?: string;
  subModuleIds: string[];
  actionIds: string[];
}

export interface PermissionSnapshot {
  userId: string;
  roleId: string;
  roleName: string;
  modules: PermissionModule[];
  projects: PermissionProject[];
}

export interface PermissionModule {
  moduleId: string;
  moduleName: string;
  subModules: PermissionSubModule[];
}

export interface PermissionSubModule {
  subModuleId: string;
  subModuleName: string;
  actions: string[];
}

export interface PermissionProject {
  projectId: string;
  projectName: string;
  modules: PermissionModule[];
}

// --- Workflow ---

export interface ApprovalConfig {
  id: string;
  name: string;
  module: string;
  description: string;
  approverRoleId: string;
  approverRoleName?: string;
  stages: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ApprovalRequest {
  id: string;
  type: string;
  referenceId: string;
  referenceLabel: string;
  requestedBy: string;
  requestedByName?: string;
  approverId: string;
  approverName?: string;
  status: ApprovalStatus;
  comments?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Delegation {
  id: string;
  delegatorId: string;
  delegatorName?: string;
  delegateId: string;
  delegateName?: string;
  module: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// --- System ---

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  entityLabel: string;
  userId: string;
  userName?: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

export type NotificationType = 'info' | 'warning' | 'success' | 'error';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  userId: string;
  createdAt: string;
}
