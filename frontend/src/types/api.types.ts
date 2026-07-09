export interface ApiResponse<T> {
  statusCode: number
  message: string | string[]
  data: T
  timestamp?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface User {
  empId: string
  name: string
  email: string
  role: string
  roles: string[]
  isActive: boolean
  department?: string
  designation?: string
}

export interface LoginPayload {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: User
}

export interface RefreshPayload {
  accessToken: string
  refreshToken: string
}

export interface PermissionTree {
  projects: ProjectPermission[]
  modules: ModulePermission[]
  actions: string[]
}

export interface ProjectPermission {
  id: string
  name: string
  modules: ModulePermission[]
}

export interface ModulePermission {
  id: string
  name: string
  subModules?: SubModulePermission[]
  actions?: string[]
}

export interface SubModulePermission {
  id: string
  name: string
  actions: string[]
}

export interface SidebarNavItem {
  label: string
  icon: string
  path?: string
  children?: SidebarNavItem[]
  module?: string
}
