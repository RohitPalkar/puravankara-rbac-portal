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

export interface SecondaryRoleEntry {
  roleId: number;
  departmentId?: number;
}

export interface UserOrganizationRequest {
  zoneId: number;
  primaryRole: number;
  isDepartmentAdmin?: boolean;
  secondaryRoles?: SecondaryRoleEntry[];
  reporting?: ReportingEntry[];
}

export interface ProfileProjectEntry {
  projectId: number;
}

export interface ProfileSubModuleEntry {
  subModuleId: number;
  inheritFutureProjects?: boolean;
  projects: ProfileProjectEntry[];
}

export interface ProfileModuleEntry {
  moduleId: number;
  subModules: ProfileSubModuleEntry[];
}

export interface CreatePermissionProfileEntry {
  profileType: string;
  roleId?: number;
  departmentId?: number;
  buddyUserId?: string;
  modules?: ProfileModuleEntry[];
}

export interface CreateUserFullRequest {
  basic: CreateUserRequest;
  organization: UserOrganizationRequest;
  profiles?: CreatePermissionProfileEntry[];
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
  zoneId: number | null;
  departmentId: number | null;
  primaryRoleId: number | null;
  isDepartmentAdmin: boolean;
  secondaryRoleId?: number | null;
  assignBuddyRm: boolean;
  buddyRmUserId?: string;
  profiles: {
    primary: UserPermissionProfile;
    secondary?: UserPermissionProfile;
    buddyRm?: UserPermissionProfile;
  };
}
