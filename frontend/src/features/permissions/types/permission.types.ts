export interface ModuleNode {
  id: string
  name: string
  subModules?: SubModuleNode[]
  actions?: string[]
}

export interface SubModuleNode {
  id: string
  name: string
  actions: string[]
}

export interface ActionNode {
  id: string
  name: string
  code: string
}

export interface PermissionMatrix {
  modules: Record<string, ModulePermissions>
}

export interface ModulePermissions {
  submodules: Record<string, string[]>
}

export interface RolePermissionRecord {
  roleId: string
  matrix: PermissionMatrix
  projectIds: string[]
}

export interface UserProjectPermissionRecord {
  userId: string
  projectId: string
  matrix: PermissionMatrix
  isOverride: boolean
}

export interface SaveRolePermissionsPayload {
  roleId: string
  matrix: PermissionMatrix
  projectIds?: string[]
}

export interface SaveUserProjectPermissionsPayload {
  userId: string
  projectId: string
  matrix: PermissionMatrix
}

export interface PermissionCheckState {
  module: 'none' | 'some' | 'all'
  subModules: Record<string, 'none' | 'some' | 'all'>
  actions: Record<string, boolean>
}

export interface PermissionTreeProps {
  matrix: PermissionMatrix
  onChange: (matrix: PermissionMatrix) => void
  readOnly?: boolean
  inheritedMatrix?: PermissionMatrix
  searchQuery?: string
}

export interface ProjectOption {
  id: string
  name: string
}
