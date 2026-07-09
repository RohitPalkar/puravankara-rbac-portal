export interface UserRecord {
  id: string
  employeeId: string
  name: string
  email: string
  phone?: string
  employmentStatus: 'Permanent' | 'Contract' | 'Serving Notice'
  zoneIds?: string[]
  zones?: { id: string; name: string }[]
  departmentId?: string
  departmentName?: string
  primaryRoleId?: string
  primaryRoleName?: string
  secondaryRoleIds?: string[]
  secondaryRoleNames?: string[]
  reportingManagerId?: string
  reportingManagerName?: string
  reportingHeadId?: string
  reportingHeadName?: string
  isActive: boolean
  createdAt: string
  updatedAt?: string
}

export interface CreateUserPayload {
  name: string
  email: string
  phone?: string
  employmentStatus: string
  zoneIds: string[]
  departmentId: string
  primaryRoleId: string
  secondaryRoleIds?: string[]
  reportingManagerId?: string
  reportingHeadId?: string
  isActive?: boolean
}

export interface UpdateUserPayload {
  name?: string
  email?: string
  phone?: string
  employmentStatus?: string
  zoneIds?: string[]
  departmentId?: string
  primaryRoleId?: string
  secondaryRoleIds?: string[]
  reportingManagerId?: string
  reportingHeadId?: string
  isActive?: boolean
}

export interface Zone {
  id: string
  name: string
}

export interface Department {
  id: string
  name: string
  maxHierarchyLevels?: number
}

export interface Role {
  id: string
  name: string
  hierarchyLevel?: number
  hierarchyLabel?: string
}

export interface UserListFilters {
  search?: string
  page?: number
  limit?: number
  departmentId?: string
  isActive?: boolean
}
