import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api/axios'
import { zones, departments, roles } from '@/services/api/endpoints'
import type {
  UserRecord,
  CreateUserPayload,
  UpdateUserPayload,
  UserListFilters,
  Zone,
  Department,
  Role,
} from '@/features/users/types/user.types'

const fetchUsers = async (filters: UserListFilters) => {
  const res = await api.get('/users', { params: filters })
  return res.data.data as { items: UserRecord[]; total: number }
}

const fetchUser = async (id: string) => {
  const res = await api.get(`/users/${id}`)
  return res.data.data as UserRecord
}

const createUser = async (payload: CreateUserPayload) => {
  const res = await api.post('/users', payload)
  return res.data.data as UserRecord
}

const updateUser = async ({ id, payload }: { id: string; payload: UpdateUserPayload }) => {
  const res = await api.patch(`/users/${id}`, payload)
  return res.data.data as UserRecord
}

const deleteUser = async (id: string) => {
  await api.delete(`/users/${id}`)
}

export function useUsers(filters: UserListFilters) {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => fetchUsers(filters),
  })
}

export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUser(id!),
    enabled: !!id,
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useZonesList() {
  return useQuery({
    queryKey: ['zones'],
    queryFn: async () => {
      const data = await zones.list()
      return (Array.isArray(data) ? data : data.items ?? data) as Zone[]
    },
  })
}

export function useDepartmentsList() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const data = await departments.list()
      return (Array.isArray(data) ? data : data.items ?? data) as Department[]
    },
  })
}

export function useRolesByDepartment(departmentId: string | undefined) {
  return useQuery({
    queryKey: ['roles', 'department', departmentId],
    queryFn: async () => {
      const data = await roles.list({ departmentId })
      return (Array.isArray(data) ? data : data.items ?? data) as Role[]
    },
    enabled: !!departmentId,
  })
}

export function useUsersByDepartment(departmentId: string | undefined, hierarchyLevel?: number) {
  return useQuery({
    queryKey: ['users', 'department', departmentId, hierarchyLevel],
    queryFn: async () => {
      const params: Record<string, unknown> = { departmentId }
      if (hierarchyLevel !== undefined) params.hierarchyLevel = hierarchyLevel
      const res = await api.get('/users', { params })
      const data = res.data.data as { items: UserRecord[]; total: number }
      return data.items ?? []
    },
    enabled: !!departmentId,
  })
}
