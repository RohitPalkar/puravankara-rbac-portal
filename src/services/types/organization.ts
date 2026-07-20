import { AppBase } from './common';

export interface Department extends AppBase {
  name: string;
  maxHierarchyLevels: number;
  isActive: boolean;
}

export interface CreateDepartmentRequest {
  name: string;
  maxHierarchyLevels?: number;
  isActive?: boolean;
}

export type UpdateDepartmentRequest = Partial<CreateDepartmentRequest>;

export interface Role extends AppBase {
  name: string;
  hierarchyLevelRank: number;
  isActive: boolean;
  isSystemRole: boolean;
}

export interface CreateRoleRequest {
  name: string;
  hierarchyLevelRank: number;
  isActive?: boolean;
}

export type UpdateRoleRequest = Partial<CreateRoleRequest>;

export interface DepartmentRole {
  departmentId: number;
  roleId: number;
  departmentName?: string;
  roleName?: string;
}
