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
  zoneId: number;
  zoneName: string;
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
  zoneId: number;
  zoneName: string;
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
  zoneId: number;
  hierarchyLevels: DepartmentHierarchyLevelInput[];
  isActive?: boolean;
}

export interface UpdateDepartmentRequest {
  name?: string;
  numberOfLevels?: number;
  departmentAdminId?: string | null;
  zoneId?: number;
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

export interface LevelImpactPreview {
  usersCount: number;
  approvalsCount: number;
  childLevelUsersCount: number;
  mergingAuto: boolean;
  mergeCandidates: number[];
  zonesImpacted: number;
}

export interface RemoveLevelPayload {
  mode: 'MERGE' | 'REPLACE';
  destinationLevelNumber?: number;
}

export interface RemoveLevelResult {
  message: string;
  mergedRolesCount: number;
  affectedUsers: number;
  affectedApprovals: number;
  autoMerged: boolean;
}

export interface CheckDepartmentNameResult {
  available: boolean;
  existingInZones?: { zoneId: number; zoneName: string }[];
  message?: string;
}

export interface AutoMergeResult {
  autoMerge: boolean;
  message?: string;
  destinationLevelNumber?: number;
}
