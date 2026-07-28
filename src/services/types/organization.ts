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
  userCount?: number;
  roleCount?: number;
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
  sourceLevel: {
    id: number;
    levelNumber: number;
    roleName: string;
    roleId: number;
  };
  department: {
    id: number;
    name: string;
    zones: { zoneId: number; name: string }[];
  };
  dependencies: {
    users: { count: number };
    permissions: {
      count: number;
      modules: { moduleId: number; name: string; count: number }[];
    };
    projects: { count: number };
    approvals: { count: number; active: number };
    reporting: { count: number };
    isDepartmentAdmin: boolean;
  };
  autoMerge: {
    eligible: boolean;
    candidateLevel: {
      id: number;
      levelNumber: number;
      roleName: string;
    } | null;
    direction: 'up' | 'down' | null;
  };
  protected: boolean;
  protectionReason: string | null;
  availableDestinations: {
    id: number;
    levelNumber: number;
    roleName: string;
  }[];
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

export interface DepartmentStats {
  total: number;
  active: number;
  inactive: number;
  zonesCovered: number;
}

export interface DeleteDependencies {
  users: number;
  roles: number;
  hierarchyLevels: number;
  approvals: number;
  reportingLines: number;
}

export interface DeleteImpactResult {
  departmentId: number;
  departmentName: string;
  zoneId: number;
  zoneName: string;
  dependencies: DeleteDependencies;
  hasDependencies: boolean;
}

export interface MergeResult {
  message: string;
  sourceDepartmentId: number;
  targetDepartmentId: number;
  usersMoved: number;
}

export interface AutoMergeResult {
  autoMerge: boolean;
  message?: string;
  destinationLevel?: {
    id: number;
    levelNumber: number;
    roleName: string;
  };
  destinationLevelNumber?: number;
}
