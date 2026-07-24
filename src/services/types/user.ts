import type { EmploymentStatus } from './enums';

export interface User {
  empId: string;
  name: string;
  email: string;
  departmentId: number;
  departmentName?: string;
  employmentStatus: EmploymentStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  departmentId: number;
  employmentStatus?: EmploymentStatus;
  isActive?: boolean;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  departmentId?: number;
  employmentStatus?: EmploymentStatus;
  isActive?: boolean;
}

export interface CreateUserRoleRequest {
  userId: string;
  departmentId: number;
  roleId: number;
}

export interface CreateUserReportingLineRequest {
  userId: string;
  reportsToUserId: string;
  levelRank: number;
  effectiveFrom?: string;
  effectiveTo?: string;
}

export interface ReportingEntry {
  levelRank: number;
  managerId: string;
}

export interface UserOrganizationRequest {
  zones: number[];
  primaryRole: number;
  secondaryRoles?: number[];
  reporting?: ReportingEntry[];
}

export interface CreateUserFullRequest {
  basic: CreateUserRequest;
  organization: UserOrganizationRequest;
}

export interface UserRole {
  id: number;
  userId: string;
  departmentId: number;
  departmentName?: string;
  roleId: number;
  roleName?: string;
}

export interface UserReportingLine {
  userId: string;
  reportsToUserId: string;
  reportsToName?: string;
  levelRank: number;
  effectiveFrom?: string;
  effectiveTo?: string;
}

export interface UserZone {
  userId: string;
  zoneId: number;
  zoneName?: string;
}

export interface SubModuleProjectMapping {
  subModuleId: number;
  enabled: boolean;
  accessType: 'all' | 'selected' | '';
  projectIds: number[];
}

export interface ModuleProjectMapping {
  moduleId: number;
  subModules: SubModuleProjectMapping[];
}

export type RolePermissionProfile = ModuleProjectMapping[];

export interface UserPermissionProfile {
  roleId?: number;
  departmentId?: number;
  buddyUserId?: string;
  permissions: RolePermissionProfile;
}

export interface ProjectMappingData {
  zoneIds: number[];
  departmentId: number;
  primaryRoleId: number;
  secondaryDepartmentId?: number;
  secondaryRoleId?: number;
  assignBuddyRm: boolean;
  buddyRmUserId?: string;
  profiles: {
    primary: UserPermissionProfile;
    secondary?: UserPermissionProfile;
    buddyRm?: UserPermissionProfile;
  };
}
