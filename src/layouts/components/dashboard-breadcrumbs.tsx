import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';

import { usePathname } from 'src/routes/hooks';

import { queryKeys } from 'src/services/api/query-keys';
import { moduleService, subModuleService } from 'src/services/services/product-catalog.service';

import { Iconify } from 'src/components/iconify';

const LABEL_MAP: Record<string, string> = {
  dashboard: 'Dashboard',
  'zone-master': 'Zone Master',
  'brand-master': 'Brand Master',
  'department-master': 'Department Master',
  'phase-master': 'Phase Master',
  'project-master': 'Project Master',
  'role-master': 'Role Master',
  'cp-type-master': 'CP Type Master',
  'channel-partner-master': 'Channel Partner Master',
  'user-management': 'User Management',
  'user-role-mapping': 'User Role Mapping',
  'project-assignment': 'Project Assignment',
  'permission-matrix': 'Permission Matrix',
  'approval-config': 'Approval Config',
  'approval-inbox': 'Approval Inbox',
  delegations: 'Delegations',
  'audit-logs': 'Audit Logs',
  notifications: 'Notifications',
  modules: 'Business Modules',
  create: 'Create',
  new: 'New',
  edit: 'Edit',
  delete: 'Delete',
  list: 'List',
  view: 'View',
};

function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function segmentToLabel(segment: string): string {
  return LABEL_MAP[segment] ?? segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function DashboardBreadcrumbs() {
  const pathname = usePathname();
  const navigate = useNavigate();

  const segments = useMemo(
    () => pathname.replace(/^\/|\/$/g, '').split('/').filter(Boolean),
    [pathname],
  );

  const isModulePage = segments[0] === 'dashboard' && segments[1] === 'modules';
  const moduleSlug = isModulePage ? segments[2] : undefined;

  const isSubmodulePage =
    isModulePage && segments[3] === 'submodule' && !!segments[4] && !Number.isNaN(Number(segments[4]));
  const submoduleId = isSubmodulePage ? Number(segments[4]) : undefined;

  const { data: modules } = useQuery({
    queryKey: queryKeys.modules.list({}),
    queryFn: async () => {
      const res = await moduleService.list({});
      return res.data ?? [];
    },
    enabled: isModulePage,
  });

  const { data: subModules } = useQuery({
    queryKey: queryKeys.subModules.list({}),
    queryFn: async () => {
      const res = await subModuleService.list({});
      return res.data ?? [];
    },
    enabled: isSubmodulePage,
  });

  const crumbs = useMemo(() => {
    const result: { label: string; href?: string }[] = [];

    segments.forEach((segment, idx) => {
      const href = `/${segments.slice(0, idx + 1).join('/')}`;

      if (isModulePage && idx === 2) {
        const module = (modules ?? []).find((m: any) => slugify(m.name) === moduleSlug);
        result.push({ label: module?.name ?? segmentToLabel(segment), href });
        return;
      }

      if (isSubmodulePage && idx === 3) {
        const subModule = (subModules ?? []).find((s: any) => s.id === submoduleId);
        result.push({ label: subModule?.name ?? segmentToLabel(segment) });
        return;
      }

      if (isSubmodulePage && idx === 4) {
        return;
      }

      result.push({ label: segmentToLabel(segment), href });
    });

    return result;
  }, [segments, isModulePage, isSubmodulePage, moduleSlug, submoduleId, modules, subModules]);

  if (crumbs.length <= 1) return null;

  return (
    <Breadcrumbs
      separator={<Iconify icon="solar:alt-arrow-right-bold" width={14} sx={{ color: 'text.disabled' }} />}
      sx={{ mb: 1.5, mt: -1 }}
    >
      {crumbs.map((crumb, idx) => {
        const isLast = idx === crumbs.length - 1;
        if (isLast || !crumb.href) {
          return (
            <Typography key={crumb.label} variant="body2" color="text.disabled">
              {crumb.label}
            </Typography>
          );
        }
        return (
          <Link
            key={crumb.label}
            variant="body2"
            underline="hover"
            color="text.primary"
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate(crumb.href!)}
          >
            {crumb.label}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}
