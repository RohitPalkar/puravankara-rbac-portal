import type { AppBase } from './common';

export interface Department extends AppBase {
  name: string;
  maxHierarchyLevels: number;
  isActive: boolean;
  departmentAdminId: string | null;
}

export interface DepartmentListItem {
  id: number;
  name: string;
  levels: number;
  maxHierarchyLevels: number;
  zones: string[];
  departmentAdminId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentDetail {
  id: number;
  name: string;
  maxHierarchyLevels: number;
  isActive: boolean;
  departmentAdminId: string | null;
  zones: { zoneId: number; zoneName: string }[];
  hierarchyLevels: HierarchyLevel[];
  createdAt: string;
  updatedAt: string;
}

export interface HierarchyLevel {
  id: number;
  levelNumber: number;
  roleName: string;
  displayOrder: number;
}

export interface DepartmentHierarchyLevelInput {
  levelNumber: number;
  roleName: string;
  displayOrder: number;
}

export interface CreateDepartmentRequest {
  name: string;
  numberOfLevels: number;
  departmentAdminId?: string;
  zoneIds: number[];
  hierarchyLevels: DepartmentHierarchyLevelInput[];
  isActive?: boolean;
}

export interface UpdateDepartmentRequest {
  name?: string;
  numberOfLevels?: number;
  departmentAdminId?: string | null;
  zoneIds?: number[];
  hierarchyLevels?: DepartmentHierarchyLevelInput[];
  isActive?: boolean;
}

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
