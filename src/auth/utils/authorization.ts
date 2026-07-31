import type { ActionPermission } from 'src/services/types/auth';

export type ProjectPermissionShape = {
  projects: {
    modules: {
      subModules: {
        name: string;
        actions: ActionPermission[];
      }[];
    }[];
  }[];
} | undefined;

export function isSuperAdmin(user: { roles?: unknown } | null | undefined): boolean {
  return Array.isArray(user?.roles) && (user as any).roles.includes('SUPER_ADMIN');
}

export function hasPermission(
  permissions: ProjectPermissionShape,
  moduleName: string,
  action: string
): boolean {
  if (!permissions) return false;
  if (!Array.isArray(permissions.projects)) return false;
  return permissions.projects.some((project) =>
    (project.modules ?? []).some((mod) =>
      (mod.subModules ?? []).some((sub) =>
        sub.name === moduleName
        && (sub.actions ?? []).some((a) => a.code === action && a.allowed)
      )
    )
  );
}

export function canAccess(
  user: { roles?: unknown } | null | undefined,
  permissions: ProjectPermissionShape,
  moduleName: string,
  action: string
): boolean {
  if (isSuperAdmin(user)) return true;
  return hasPermission(permissions, moduleName, action);
}

export function hasAnyAction(
  permissions: ProjectPermissionShape,
  moduleName: string
): boolean {
  if (!permissions) return false;
  if (!Array.isArray(permissions.projects)) return false;
  return permissions.projects.some((project) =>
    (project.modules ?? []).some((mod) =>
      (mod.subModules ?? []).some((sub) =>
        sub.name === moduleName
        && (sub.actions ?? []).some((a) => a.allowed)
      )
    )
  );
}
