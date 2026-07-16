export type Status = 'active' | 'inactive';

export interface Zone {
  id: string;
  name: string;
  salaryCap?: number;
  status?: Status;
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
  maxHierarchyLevels: number;
  createdBy: string;
  status?: Status;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  code?: string;
  description?: string;
  level: string;
  departmentId: string;
  departmentName?: string;
  createdBy: string;
  status?: Status;
  createdAt: string;
  updatedAt: string;
}

export interface Module {
  id: string;
  name: string;
  code: string;
  icon: string;
  sortOrder: number;
  status?: Status;
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
  status?: Status;
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
  status?: Status;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  brand: string;
  zoneId: string;
  zoneName?: string;
  cityId: string;
  cityName?: string;
  phase: string;
  billingEntity: string;
  billingAddress: string;
  gstin: string;
  paymentGateway: string;
  incentiveCriteria: string;
  projectImage?: string;
  jvImage?: string;
  startDate: string;
  endDate: string;
  status?: Status;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  departmentId: string;
  departmentName?: string;
  roleId: string;
  roleName?: string;
  secondaryRoleId?: string;
  secondaryRoleName?: string;
  level: string;
  employmentStatus?: 'permanent' | 'contract' | 'serving_notice_period';
  userGroup?: string;
  startDate?: string;
  endDate?: string;
  reportingManagerId?: string;
  reportingManagerName?: string;
  zoneIds: string[];
  zoneNames?: string[];
  createdBy: string;
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

export interface PermissionMapping {
  id: string;
  departmentId: string;
  departmentName: string;
  level: string;
  roleId: string;
  roleName: string;
  modules: PermissionMappingModule[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  status?: Status;
}

export interface PermissionMappingModule {
  moduleId: string;
  moduleName: string;
  moduleIcon?: string;
  subModules: PermissionMappingSubModule[];
}

export interface PermissionMappingSubModule {
  subModuleId: string;
  subModuleName: string;
  actionIds: string[];
  actionNames: string[];
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

// --- RBAC Navigation ---

export interface NavPermissionModule {
  code: string;
  name: string;
  route: string;
  allowed: boolean;
  children?: NavPermissionModule[];
  actions?: string[];
}

export interface PermissionResponse {
  user: {
    id: string;
    name: string;
    email?: string;
    role?: string;
    departmentId?: string;
    level?: string;
  };
  permissions: {
    modules: NavPermissionModule[];
  };
}

export interface MockUserRoleInfo {
  roleId: string;
  roleName: string;
  isPrimary: boolean;
}

export interface MockUserProfile {
  user: {
    id: string;
    employeeId: string;
    name: string;
    email: string;
    departmentId?: string;
    departmentName?: string;
    avatarUrl?: string;
  };
  roles: MockUserRoleInfo[];
  permissionResponses: Record<string, PermissionResponse>;
}

export interface Brand {
  id: string;
  brandName: string;
  salaryMultiplier: number;
  razorpayMerchantId?: string;
  razorpaySecretKey?: string;
  easebuzzBookingSalt?: string;
  easebuzzBookingKey?: string;
  easebuzzBookingSubMerchantId?: string;
  easebuzzMilestoneSalt?: string;
  easebuzzMilestoneKey?: string;
  easebuzzMilestoneSubMerchantId?: string;
  billingName?: string;
  panNumber?: string;
  gstin?: string;
  address1?: string;
  address2?: string;
  pinCode?: string;
  logoUrl?: string;
  reraRegularizationPercentage?: number;
  reraQualificationPercentage?: number;
  maximumRegularizationDays?: number;
  rtmRegularizationPercentage?: number;
  rtmQualificationPercentage?: number;
  regularizationStartDate?: string;
  termsAndConditions?: string;
  status?: Status;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface NavItem {
  title: string;
  path: string;
  icon?: string | React.ReactNode;
  info?: string[] | React.ReactNode;
  caption?: string;
  disabled?: boolean;
  roles?: string[];
  children?: NavItem[];
}

export interface NavSection {
  subheader?: string;
  items: NavItem[];
}
