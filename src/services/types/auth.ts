export interface AuthUser {
  empId: string;
  name: string;
  email: string;
  role: string;
  roles: string[];
}

export interface ActionPermission {
  code: string;
  label: string;
  allowed: boolean;
}

export interface SubModulePermissions {
  id: number;
  name: string;
  actions: ActionPermission[];
}

export interface ModulePermissions {
  id: number;
  name: string;
  subModules: SubModulePermissions[];
}

export interface ProjectPermissions {
  id: number;
  name: string;
  modules: ModulePermissions[];
}

export interface CompiledPermissions {
  projects: ProjectPermissions[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
  permissions?: CompiledPermissions;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface SetPasswordRequest {
  userId: string;
  password: string;
}

export interface MeUser {
  empId: string;
  name: string;
  email: string;
  departmentId: number | null;
  department: string | null;
  employmentStatus: string | null;
}

export interface MeRole {
  departmentId: number;
  departmentName: string;
  roleId: number;
  roleName: string;
  hierarchyLevelRank?: number;
}

export interface MeResponse {
  user: MeUser;
  roles: MeRole[];
}
