import { useMemo } from 'react';

import { MOCK_USER_PROFILES } from 'src/services/mock-data';
import { usePermissionStore } from 'src/stores/permission-store';

export function usePermission() {
  const permissionResponse = usePermissionStore((s) => s.permissionResponse);
  const activeProfileId = usePermissionStore((s) => s.activeProfileId);
  const activeRoleId = usePermissionStore((s) => s.activeRoleId);
  const availableRoles = usePermissionStore((s) => s.availableRoles);
  const hasPermission = usePermissionStore((s) => s.hasPermission);
  const can = usePermissionStore((s) => s.can);
  const canAny = usePermissionStore((s) => s.canAny);
  const getAllowedModules = usePermissionStore((s) => s.getAllowedModules);
  const getModuleActions = usePermissionStore((s) => s.getModuleActions);

  const hasModule = (code: string) => hasPermission(code);

  const activeUser = useMemo(() => {
    if (!activeProfileId) return null;
    const profile = MOCK_USER_PROFILES[activeProfileId];
    if (!profile) return null;
    return profile.user;
  }, [activeProfileId]);

  const activeRole = useMemo(() => {
    if (!activeRoleId) return null;
    return availableRoles.find((r) => r.roleId === activeRoleId) ?? null;
  }, [activeRoleId, availableRoles]);

  return {
    permissionResponse,
    activeProfileId,
    activeRoleId,
    activeRole,
    availableRoles,
    activeUser,
    hasModule,
    hasPermission,
    can,
    canAny,
    getAllowedModules,
    getModuleActions,
  };
}

export function useModuleActions(moduleCode: string) {
  const getModuleActions = usePermissionStore((s) => s.getModuleActions);
  const hasPermission = usePermissionStore((s) => s.hasPermission);
  const allowed = hasPermission(moduleCode);
  const actions = getModuleActions(moduleCode);

  return useMemo(() => ({ allowed, actions }), [allowed, actions]);
}

export function useCan(moduleCode: string, action: string) {
  const can = usePermissionStore((s) => s.can);
  return useMemo(() => can(moduleCode, action), [can, moduleCode, action]);
}