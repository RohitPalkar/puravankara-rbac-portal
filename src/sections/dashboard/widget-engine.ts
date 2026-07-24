import type { ComponentType } from 'react';

export type WidgetSize = 'full' | 'half' | 'third' | 'two-thirds';
export type WidgetSection =
  | 'welcome'
  | 'kpi'
  | 'analytics'
  | 'operations'
  | 'zone'
  | 'security'
  | 'health'
  | 'activities'
  | 'quick-actions';

export interface WidgetMeta {
  id: string;
  title: string;
  section: WidgetSection;
  requiredModule?: string;
  requiredSubModule?: string;
  requiredPermission?: string;
  requiredRole?: string;
  priority: number;
  size: WidgetSize;
  component: ComponentType<any>;
  props?: Record<string, unknown>;
}

export interface WidgetContext {
  me: any;
  myPermissions: any;
  moduleTree: any;
  auditLogs: any;
  auditLoading: boolean;
  isSuperAdmin: boolean;
}

export function hasModuleAccess(
  myPermissions: any,
  moduleName: string,
  permission?: string,
): boolean {
  if (!myPermissions) return false;
  return myPermissions.projects.some((project: any) =>
    project.modules.some((mod: any) =>
      mod.subModules.some((sm: any) => {
        if (moduleName && sm.name !== moduleName) return false;
        if (permission) return sm.actions.some((a: any) => a.code === permission && a.allowed);
        return sm.actions.some((a: any) => a.allowed);
      }),
    ),
  );
}

export function hasAnyActionAccess(myPermissions: any): boolean {
  if (!myPermissions) return false;
  return myPermissions.projects.some((project: any) =>
    project.modules.some((mod: any) =>
      mod.subModules.some((sm: any) => sm.actions.some((a: any) => a.allowed)),
    ),
  );
}

export function filterWidgets(
  widgets: WidgetMeta[],
  ctx: WidgetContext,
): WidgetMeta[] {
  return widgets.filter((w) => {
    if (ctx.isSuperAdmin) return true;
    if (w.requiredModule) {
      const hasAccess = hasModuleAccess(ctx.myPermissions, w.requiredModule, w.requiredPermission);
      if (!hasAccess) return false;
    }
    return true;
  });
}

export function groupWidgetsBySection(widgets: WidgetMeta[]): Record<WidgetSection, WidgetMeta[]> {
  const groups: Record<string, WidgetMeta[]> = {};
  widgets.forEach((w) => {
    if (!groups[w.section]) groups[w.section] = [];
    groups[w.section].push(w);
  });
  Object.values(groups).forEach((g) => g.sort((a, b) => a.priority - b.priority));
  return groups as Record<WidgetSection, WidgetMeta[]>;
}
