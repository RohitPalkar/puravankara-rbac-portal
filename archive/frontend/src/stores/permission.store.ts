import { create } from 'zustand'
import type { PermissionTree } from '@/types/api.types'
import { permissions as permissionsApi } from '@/services/api/endpoints'

interface PermissionState {
  tree: PermissionTree | null
  projects: string[]
  modules: string[]
  actions: string[]
  isLoading: boolean

  bootstrap: () => Promise<void>
  setPermissions: (tree: PermissionTree) => void
  reset: () => void
  hasModule: (moduleName: string) => boolean
  hasAction: (action: string) => boolean
}

export const usePermissionStore = create<PermissionState>((set, get) => ({
  tree: null,
  projects: [],
  modules: [],
  actions: [],
  isLoading: false,

  bootstrap: async () => {
    set({ isLoading: true })
    try {
      const tree = await permissionsApi.me()
      const modules = tree.modules?.map((m) => m.name) ?? []
      const actions = tree.actions ?? []
      const projects = tree.projects?.map((p) => p.name) ?? []
      set({ tree, projects, modules, actions, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  setPermissions: (tree) => {
    const modules = tree.modules?.map((m) => m.name) ?? []
    const actions = tree.actions ?? []
    const projects = tree.projects?.map((p) => p.name) ?? []
    set({ tree, projects, modules, actions })
  },

  reset: () => set({ tree: null, projects: [], modules: [], actions: [] }),

  hasModule: (moduleName) => get().modules.includes(moduleName),
  hasAction: (action) => get().actions.includes(action),
}))
