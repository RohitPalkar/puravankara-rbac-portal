import { useMemo } from 'react';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { useMyPermissions } from 'src/services/hooks/use-permissions';
import { useModuleTree } from 'src/services/hooks/use-product-catalog';

import { SvgColor } from 'src/components/svg-color';

const icon = (name: string) => (
  <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />
);

const ICONS = {
  dashboard: icon('ic-dashboard'),
  zone: icon('ic-map'),
  project: icon('ic-folder'),
  department: icon('ic-building'),
  brand: icon('ic-building'),
  user: icon('ic-user'),
  permission: icon('ic-lock'),
  audit: icon('ic-analytics'),
  settings: icon('ic-calendar'),
  module: icon('ic-folder'),
};

function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export function useNavData() {
  const { data: moduleTree } = useModuleTree();
  const { data: myPermissions } = useMyPermissions();

  return useMemo(() => {
    const allowedModuleIds = new Set<number>();
    const allowedSubModuleIds = new Set<number>();

    if (myPermissions?.projects) {
      myPermissions.projects.forEach((project) => {
        project.modules.forEach((mod) => {
          const hasAnyAction = mod.subModules.some((sm) =>
            sm.actions.some((a) => a.allowed),
          );
          if (hasAnyAction) {
            allowedModuleIds.add(mod.id);
          }
          mod.subModules.forEach((sm) => {
            if (sm.actions.some((a) => a.allowed)) {
              allowedSubModuleIds.add(sm.id);
            }
          });
        });
      });
    }

    const permissionsReady = !!myPermissions;

    const dynamicItems = !permissionsReady ? [] : (moduleTree ?? [])
      .filter((mod) => allowedModuleIds.has(mod.id))
      .map((mod) => {
        const moduleSlug = slugify(mod.code ?? mod.name);
        const subItems = mod.subModules
          .filter((sm) => allowedSubModuleIds.has(sm.id))
          .map((sm) => ({
            title: sm.name,
            path: paths.dashboard.modules.dashboard(moduleSlug),
          }));

        return {
          title: mod.name,
          path: paths.dashboard.modules.dashboard(moduleSlug),
          icon: ICONS.module,
          ...(subItems.length > 0 && { children: subItems }),
        };
      });

    return [
      {
        subheader: 'Dashboard',
        items: [
          { title: 'Dashboard', path: paths.dashboard.root, icon: ICONS.dashboard },
        ],
      },
      ...(dynamicItems.length > 0
        ? [{ subheader: 'Business Modules', items: dynamicItems }]
        : []),
      {
        subheader: 'Masters',
        items: [
          { title: 'Zone Master', path: paths.dashboard.zoneMaster, icon: ICONS.zone },
          { title: 'Brand Master', path: paths.dashboard.brandMaster, icon: ICONS.brand },
          { title: 'Department Master', path: paths.dashboard.departmentMaster, icon: ICONS.department },
          { title: 'Project Master', path: paths.dashboard.projectMaster, icon: ICONS.project },
          { title: 'Phase Master', path: paths.dashboard.phaseMaster, icon: ICONS.project },
          { title: 'Channel Partner', path: paths.dashboard.channelPartnerMaster, icon: ICONS.user },
        ],
      },
      {
        subheader: 'Access Management',
        items: [
          { title: 'User Management', path: paths.dashboard.userManagement, icon: ICONS.user },
          { title: 'Permission Matrix', path: paths.dashboard.permissionMatrix, icon: ICONS.permission },
        ],
      },
      {
        subheader: 'Administration',
        items: [
          { title: 'Audit Logs', path: paths.dashboard.auditLogs, icon: ICONS.audit },
          { title: 'Settings', path: paths.dashboard.settings, icon: ICONS.settings },
        ],
      },
    ];
  }, [moduleTree, myPermissions]);
}
