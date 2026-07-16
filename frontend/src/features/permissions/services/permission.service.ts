import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api/axios'
import type {
  ModuleNode,
  PermissionMatrix,
  RolePermissionRecord,
  UserProjectPermissionRecord,
  SaveRolePermissionsPayload,
  SaveUserProjectPermissionsPayload,
} from '@/features/permissions/types/permission.types'

// ──────────────────────────
// Module Tree (composed from /modules, /sub-modules, /actions)
// ──────────────────────────

const fetchModuleTree = async (): Promise<ModuleNode[]> => {
  const [modulesRes, subModulesRes, actionsRes] = await Promise.all([
    api.get('/modules'),
    api.get('/sub-modules'),
    api.get('/actions'),
  ])

  const modules = modulesRes.data.data?.items ?? modulesRes.data.data ?? []
  const subModules = subModulesRes.data.data?.items ?? subModulesRes.data.data ?? []
  const actions = actionsRes.data.data?.items ?? actionsRes.data.data ?? []

  return modules.map((m: any) => {
    const relatedSubs = subModules.filter((sm: any) => sm.moduleId === m.id)
    return {
      id: m.id,
      name: m.name,
      actions: !relatedSubs.length ? actions.filter((a: any) => a.moduleId === m.id).map((a: any) => a.name) : undefined,
      subModules: relatedSubs.length
        ? relatedSubs.map((sm: any) => ({
            id: sm.id,
            name: sm.name,
            actions: actions.filter((a: any) => a.subModuleId === sm.id).map((a: any) => a.name),
          }))
        : undefined,
    }
  })
}

export function useModuleTree() {
  return useQuery({
    queryKey: ['module-tree'],
    queryFn: fetchModuleTree,
    staleTime: 5 * 60 * 1000,
  })
}

// ──────────────────────────
// Role Permissions
// ──────────────────────────

const fetchRolePermissions = async (roleId: string): Promise<RolePermissionRecord> => {
  const res = await api.get(`/permissions/role/${roleId}`)
  return res.data.data as RolePermissionRecord
}

const saveRolePermissions = async (payload: SaveRolePermissionsPayload) => {
  const res = await api.post(`/permissions/role/${payload.roleId}`, payload)
  return res.data.data
}

export function useRolePermissions(roleId: string | undefined) {
  return useQuery({
    queryKey: ['role-permissions', roleId],
    queryFn: () => fetchRolePermissions(roleId!),
    enabled: !!roleId,
  })
}

export function useSaveRolePermissions() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: saveRolePermissions,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['role-permissions'] })
    },
  })
}

// ──────────────────────────
// User Project Permissions
// ──────────────────────────

const fetchUserProjectPermissions = async (
  userId: string,
  projectId: string,
): Promise<UserProjectPermissionRecord> => {
  const res = await api.get(`/permissions/user/${userId}/project/${projectId}`)
  return res.data.data as UserProjectPermissionRecord
}

const saveUserProjectPermissions = async (payload: SaveUserProjectPermissionsPayload) => {
  const res = await api.post(`/permissions/user/${payload.userId}/project/${payload.projectId}`, payload)
  return res.data.data
}

export function useUserProjectPermissions(userId: string | undefined, projectId: string | undefined) {
  return useQuery({
    queryKey: ['user-project-permissions', userId, projectId],
    queryFn: () => fetchUserProjectPermissions(userId!, projectId!),
    enabled: !!userId && !!projectId,
  })
}

export function useSaveUserProjectPermissions() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: saveUserProjectPermissions,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-project-permissions'] })
    },
  })
}

// ──────────────────────────
// Helper: build empty matrix from tree
// ──────────────────────────

export function buildEmptyMatrix(tree: ModuleNode[]): PermissionMatrix {
  const modules: Record<string, { submodules: Record<string, string[]> }> = {}
  for (const mod of tree) {
    if (mod.subModules) {
      const submodules: Record<string, string[]> = {}
      for (const sm of mod.subModules) {
        submodules[sm.name] = []
      }
      modules[mod.name] = { submodules }
    } else if (mod.actions) {
      modules[mod.name] = { submodules: {} }
    }
  }
  return { modules }
}

// ──────────────────────────
// Helper: update matrix with toggled action
// ──────────────────────────

export function toggleAction(
  matrix: PermissionMatrix,
  moduleName: string,
  subModuleName: string | null,
  actionName: string,
): PermissionMatrix {
  const next = structuredClone(matrix)
  if (!next.modules[moduleName]) return next

  if (subModuleName) {
    const actions = next.modules[moduleName].submodules[subModuleName]
    if (!actions) return next
    if (actions.includes(actionName)) {
      next.modules[moduleName].submodules[subModuleName] = actions.filter((a) => a !== actionName)
    } else {
      next.modules[moduleName].submodules[subModuleName] = [...actions, actionName]
    }
  } else {
    next.modules[moduleName].submodules['__direct'] = next.modules[moduleName].submodules['__direct'] ?? []
    const actions = next.modules[moduleName].submodules['__direct']
    if (actions.includes(actionName)) {
      next.modules[moduleName].submodules['__direct'] = actions.filter((a) => a !== actionName)
    } else {
      next.modules[moduleName].submodules['__direct'] = [...actions, actionName]
    }
  }
  return next
}

export function toggleSubModule(
  matrix: PermissionMatrix,
  moduleName: string,
  subModuleName: string,
  allActions: string[],
): PermissionMatrix {
  const next = structuredClone(matrix)
  if (!next.modules[moduleName]) return next

  const current = next.modules[moduleName].submodules[subModuleName] ?? []
  const isAllSelected = allActions.every((a) => current.includes(a))

  next.modules[moduleName].submodules[subModuleName] = isAllSelected ? [] : [...allActions]
  return next
}

export function toggleModule(
  matrix: PermissionMatrix,
  moduleName: string,
  allActionEntries: { subModuleName: string | null; action: string }[],
): PermissionMatrix {
  const next = structuredClone(matrix)
  if (!next.modules[moduleName]) return next

  const allSelected = allActionEntries.every(
    ({ subModuleName, action }) =>
      next.modules[moduleName].submodules[subModuleName ?? '__direct']?.includes(action),
  )

  for (const { subModuleName, action } of allActionEntries) {
    const key = subModuleName ?? '__direct'
    const arr = next.modules[moduleName].submodules[key] ?? []
    if (allSelected) {
      next.modules[moduleName].submodules[key] = arr.filter((a) => a !== action)
    } else {
      if (!arr.includes(action)) {
        next.modules[moduleName].submodules[key] = [...arr, action]
      }
    }
  }
  return next
}

export function getAllActionEntries(tree: ModuleNode[]): { moduleName: string; subModuleName: string | null; action: string }[] {
  const entries: { moduleName: string; subModuleName: string | null; action: string }[] = []
  for (const mod of tree) {
    if (mod.subModules) {
      for (const sm of mod.subModules) {
        for (const action of sm.actions) {
          entries.push({ moduleName: mod.name, subModuleName: sm.name, action })
        }
      }
    } else if (mod.actions) {
      for (const action of mod.actions) {
        entries.push({ moduleName: mod.name, subModuleName: null, action })
      }
    }
  }
  return entries
}
