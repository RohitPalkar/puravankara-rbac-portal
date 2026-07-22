import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { usePathname } from 'src/routes/hooks';

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

function segmentToLabel(segment: string): string {
  return LABEL_MAP[segment] ?? segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function DashboardBreadcrumbs() {
  const pathname = usePathname();
  const navigate = useNavigate();

  const crumbs = useMemo(() => {
    const segments = pathname.replace(/^\/|\/$/g, '').split('/').filter(Boolean);
    const result: { label: string; href?: string }[] = [];

    segments.forEach((segment, idx) => {
      const label = segmentToLabel(segment);
      const href = `/${segments.slice(0, idx + 1).join('/')}`;
      result.push({ label, href });
    });

    return result;
  }, [pathname]);

  if (crumbs.length <= 1) return null;

  return (
    <Breadcrumbs
      separator={<Iconify icon="solar:alt-arrow-right-bold" width={14} sx={{ color: 'text.disabled' }} />}
      sx={{ mb: 1.5, mt: -1 }}
    >
      {crumbs.map((crumb, idx) => {
        const isLast = idx === crumbs.length - 1;
        if (isLast) {
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
