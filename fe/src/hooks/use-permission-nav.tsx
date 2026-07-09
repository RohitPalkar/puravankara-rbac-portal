import type { NavSection } from 'src/types';

import { useMemo } from 'react';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { usePermissionStore } from 'src/stores/permission-store';

import { SvgColor } from 'src/components/svg-color';

const icon = (name: string) => (
  <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />
);

const ADMIN_REGISTRY: Record<string, { title: string; path: string; icon: React.ReactNode }> = {
  DASHBOARD: { title: 'Dashboard', path: paths.dashboard.root, icon: icon('ic-dashboard') },
  ZONE_MGMT: { title: 'Zone Management', path: paths.dashboard.zoneMaster, icon: icon('ic-map') },
  DEPARTMENTS: { title: 'Departments', path: paths.dashboard.departmentMaster, icon: icon('ic-building') },
  PROJECTS: { title: 'Projects', path: paths.dashboard.projectMaster, icon: icon('ic-folder') },
  PERMISSION_MATRIX: { title: 'Permission Mapping', path: paths.dashboard.permissionMatrix, icon: icon('ic-lock') },
  USERS: { title: 'Users', path: paths.dashboard.userManagement, icon: icon('ic-user') },
  ACTIVITY_LOGS: { title: 'Activity Logs', path: paths.dashboard.auditLogs, icon: icon('ic-analytics') },
};

const APP_REGISTRY: Record<string, { title: string; path: string; icon: React.ReactNode }> = {
  CRM: { title: 'CRM', path: paths.apps.crm, icon: icon('ic-user') },
  EOI: { title: 'EOI', path: paths.apps.eoi, icon: icon('ic-file') },
  IOM: { title: 'IOM', path: paths.apps.iom, icon: icon('ic-file') },
  BOOKINGS: { title: 'Bookings', path: paths.apps.bookings, icon: icon('ic-booking') },
  INVENTORY: { title: 'Inventory', path: paths.apps.inventory, icon: icon('ic-folder') },
  FINANCE: { title: 'Finance', path: paths.apps.finance, icon: icon('ic-analytics') },
  REPORTS: { title: 'Reports', path: paths.apps.reports, icon: icon('ic-analytics') },
  DOCUMENTS: { title: 'Documents', path: paths.apps.documents, icon: icon('ic-folder') },
  ESIGNATURE: { title: 'eSignature', path: paths.apps.esignature, icon: icon('ic-lock') },
};

export function usePermissionNav(): { navData: NavSection[] } {
  const permissionResponse = usePermissionStore((s) => s.permissionResponse);
  const hasPermissionResponse = permissionResponse !== null;
  const allowedModules = useMemo(() => (permissionResponse?.permissions.modules ?? []).filter((m) => m.allowed), [permissionResponse]);

  return useMemo(() => {
    if (hasPermissionResponse) {
      const adminItems: { title: string; path: string; icon: React.ReactNode }[] = [];
      const appItems: { title: string; path: string; icon: React.ReactNode }[] = [];

      allowedModules.forEach((m) => {
        const adminDef = ADMIN_REGISTRY[m.code];
        if (adminDef) {
          adminItems.push(adminDef);
          return;
        }
        const appDef = APP_REGISTRY[m.code];
        if (appDef) {
          appItems.push(appDef);
        }
      });

      const sections: NavSection[] = [];
      if (adminItems.length > 0) {
        const hasMasters = ['ZONE_MGMT', 'DEPARTMENTS'].some((c) => allowedModules.some((m) => m.code === c));
        if (hasMasters) {
          const masterItems = ['ZONE_MGMT', 'DEPARTMENTS']
            .filter((c) => allowedModules.some((m) => m.code === c))
            .map((c) => ADMIN_REGISTRY[c]);
          const restItems = adminItems.filter((i) => !['DASHBOARD', 'ZONE_MGMT', 'DEPARTMENTS'].includes(
            Object.entries(ADMIN_REGISTRY).find(([, v]) => v.title === i.title)?.[0] ?? ''
          ));
          sections.push({
            subheader: 'Administration',
            items: [
              ...(allowedModules.some((m) => m.code === 'DASHBOARD') ? [ADMIN_REGISTRY.DASHBOARD] : []),
              ...(masterItems.length > 0 ? [{ title: 'Masters', path: '#', icon: icon('ic-dashboard'), children: masterItems }] : []),
              ...restItems,
            ],
          });
        } else {
          sections.push({ subheader: 'Administration', items: adminItems });
        }
      }
      if (appItems.length > 0) {
        sections.push({ subheader: 'Applications', items: appItems });
      }

      return { navData: sections };
    }

    // Fallback: show all nav
    return {
      navData: [
        {
          subheader: 'Administration',
          items: [
            ADMIN_REGISTRY.DASHBOARD,
            {
              title: 'Masters',
              path: '#',
              icon: icon('ic-dashboard'),
              children: [
                ADMIN_REGISTRY.ZONE_MGMT,
                ADMIN_REGISTRY.DEPARTMENTS,
              ],
            },
            ADMIN_REGISTRY.PROJECTS,
            ADMIN_REGISTRY.PERMISSION_MATRIX,
            ADMIN_REGISTRY.USERS,
            ADMIN_REGISTRY.ACTIVITY_LOGS,
          ],
        },
        {
          subheader: 'Applications',
          items: Object.values(APP_REGISTRY),
        },
      ],
    };
  }, [allowedModules, hasPermissionResponse]);
}
