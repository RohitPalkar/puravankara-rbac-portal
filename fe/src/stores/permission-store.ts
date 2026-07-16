import type { MockUserRoleInfo, PermissionSnapshot, PermissionResponse, NavPermissionModule } from 'src/types';

import { create } from 'zustand';

interface PermissionState {
  snapshot: PermissionSnapshot | null;
  permissionResponse: PermissionResponse | null;
  activeProfileId: string | null;
  activeRoleId: string | null;
  availableRoles: MockUserRoleInfo[];
  setSnapshot: (snapshot: PermissionSnapshot) => void;
  setPermissionResponse: (res: PermissionResponse) => void;
  setActiveProfile: (profileId: string, roleId: string, res: PermissionResponse, roles: MockUserRoleInfo[]) => void;
  switchRole: (roleId: string, res: PermissionResponse) => void;
  clearSnapshot: () => void;
  hasPermission: (code: string) => boolean;
  can: (moduleCode: string, action: string) => boolean;
  canAny: (moduleCode: string, actions: string[]) => boolean;
  getAllowedModules: () => NavPermissionModule[];
  getModuleActions: (moduleCode: string) => string[];
}

export const usePermissionStore = create<PermissionState>((set, get) => ({
  snapshot: null,
  permissionResponse: null,
  activeProfileId: null,
  activeRoleId: null,
  availableRoles: [],

  setSnapshot: (snapshot) => set({ snapshot }),

  setPermissionResponse: (res) => set({ permissionResponse: res }),

  setActiveProfile: (profileId, roleId, res, roles) => set({
    activeProfileId: profileId,
    activeRoleId: roleId,
    permissionResponse: res,
    availableRoles: roles,
  }),

  switchRole: (roleId, res) => set({
    activeRoleId: roleId,
    permissionResponse: res,
  }),

  clearSnapshot: () => set({ snapshot: null, permissionResponse: null, activeProfileId: null, activeRoleId: null, availableRoles: [] }),

  hasPermission: (code: string) => {
    const modules = get().permissionResponse?.permissions.modules ?? [];
    return modules.some((m) => m.code === code && m.allowed);
  },

  can: (moduleCode: string, action: string) => {
    const modules = get().permissionResponse?.permissions.modules ?? [];
    const mod = modules.find((m) => m.code === moduleCode);
    if (!mod || !mod.allowed) return false;
    if (!mod.actions || mod.actions.length === 0) return true;
    return mod.actions.includes(action);
  },

  canAny: (moduleCode: string, actions: string[]) => {
    const modules = get().permissionResponse?.permissions.modules ?? [];
    const mod = modules.find((m) => m.code === moduleCode);
    if (!mod || !mod.allowed) return false;
    if (!mod.actions || mod.actions.length === 0) return true;
    return actions.some((a) => mod.actions!.includes(a));
  },

  getAllowedModules: () => (get().permissionResponse?.permissions.modules ?? []).filter((m) => m.allowed),

  getModuleActions: (moduleCode: string) => {
    const modules = get().permissionResponse?.permissions.modules ?? [];
    const mod = modules.find((m) => m.code === moduleCode);
    return mod?.actions ?? [];
  },
}));