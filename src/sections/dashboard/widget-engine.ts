import type { ComponentType } from 'react';

import { KpiCards } from './widgets/kpi-cards';
import { AnalyticsSection } from './widgets/charts';
import { QuickActions } from './widgets/quick-actions';
import { SystemStatus } from './widgets/system-status';
import { ZoneOverview } from './widgets/zone-overview';
import { WelcomeBanner } from './widgets/welcome-banner';
import { OperationsHub } from './widgets/operations-hub';
import { RecentActivity } from './widgets/recent-activity';
import { SecurityCenter, SystemHealthWidget } from './widgets/security-health';

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
  | 'quick-actions'
  | 'system-status';

export interface WidgetMeta {
  id: string;
  title: string;
  section: WidgetSection;
  requiredRole?: 'super_admin' | 'any';
  priority: number;
  size: WidgetSize;
  component: ComponentType<any>;
  props?: Record<string, unknown>;
  gridWidth?: { xs?: number; md?: number };
}

export interface WidgetContext {
  me: any;
  myPermissions: any;
  moduleTree: any;
  auditLogs: any;
  auditLoading: boolean;
  isSuperAdmin: boolean;
  selectedZoneId?: number;
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
    if (w.requiredRole === 'super_admin') return false;
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

export function createWidgetRegistry(ctx: WidgetContext): WidgetMeta[] {
  return [
    {
      id: 'welcome-banner',
      title: 'Welcome',
      section: 'welcome',
      priority: 0,
      size: 'full',
      component: WelcomeBanner,
      props: { me: ctx.me },
      gridWidth: { xs: 12 },
    },
    {
      id: 'kpi-cards',
      title: 'Overview',
      section: 'kpi',
      priority: 1,
      size: 'full',
      component: KpiCards,
      props: { zoneId: ctx.selectedZoneId },
      gridWidth: { xs: 12 },
    },
    {
      id: 'analytics-charts',
      title: 'Analytics',
      section: 'analytics',
      requiredRole: 'super_admin',
      priority: 2,
      size: 'full',
      component: AnalyticsSection,
      props: { auditLogs: ctx.auditLogs, auditLoading: ctx.auditLoading, moduleTree: ctx.moduleTree },
      gridWidth: { xs: 12 },
    },
    {
      id: 'zone-overview',
      title: 'Zone Overview',
      section: 'zone',
      requiredRole: 'super_admin',
      priority: 3,
      size: 'full',
      component: ZoneOverview,
      gridWidth: { xs: 12 },
    },
    {
      id: 'operations-hub',
      title: 'Operations Hub',
      section: 'operations',
      requiredRole: 'super_admin',
      priority: 4,
      size: 'full',
      component: OperationsHub,
      props: { zoneId: ctx.selectedZoneId },
      gridWidth: { xs: 12 },
    },
    {
      id: 'recent-activity',
      title: 'Recent Activity',
      section: 'activities',
      requiredRole: 'super_admin',
      priority: 5,
      size: 'two-thirds',
      component: RecentActivity,
      gridWidth: { xs: 12, md: 7 },
    },
    {
      id: 'system-status',
      title: 'System Status',
      section: 'system-status',
      requiredRole: 'super_admin',
      priority: 6,
      size: 'third',
      component: SystemStatus,
      props: { zoneId: ctx.selectedZoneId },
      gridWidth: { xs: 12, md: 5 },
    },
    {
      id: 'security-center',
      title: 'Security Center',
      section: 'security',
      requiredRole: 'super_admin',
      priority: 7,
      size: 'half',
      component: SecurityCenter,
      gridWidth: { xs: 12, md: 6 },
    },
    {
      id: 'system-health',
      title: 'System Health',
      section: 'health',
      requiredRole: 'super_admin',
      priority: 8,
      size: 'half',
      component: SystemHealthWidget,
      gridWidth: { xs: 12, md: 6 },
    },
    {
      id: 'quick-actions',
      title: 'Quick Actions',
      section: 'quick-actions',
      requiredRole: 'super_admin',
      priority: 9,
      size: 'full',
      component: QuickActions,
      gridWidth: { xs: 12 },
    },
  ];
}
