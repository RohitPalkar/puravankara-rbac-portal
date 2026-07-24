import type { MeRole } from 'src/services/types/auth';

import dayjs from 'dayjs';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useMemo, type ReactNode } from 'react';
import relativeTime from 'dayjs/plugin/relativeTime';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { useMe } from 'src/services/hooks/use-auth';
import { useAuditLogList } from 'src/services/hooks/use-audit';
import { useMyPermissions } from 'src/services/hooks/use-permissions';
import { useModuleTree } from 'src/services/hooks/use-product-catalog';

import { Iconify } from 'src/components/iconify';
import { PageContainer } from 'src/components/page-layout';

dayjs.extend(relativeTime);

const ACTION_ICONS: Record<string, string> = {
  CREATE: 'solar:add-circle-bold',
  VIEW: 'solar:eye-bold',
  EDIT: 'solar:pen-bold',
  DELETE: 'solar:trash-bin-trash-bold',
  APPROVE: 'solar:check-circle-bold',
  EXPORT: 'solar:export-bold',
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

interface DashboardWidget {
  id: string;
  size: 'full' | 'half' | 'third' | 'two-thirds';
  component: () => ReactNode;
}

function WelcomeWidget({ me, roleSummary }: { me: any; roleSummary: any }) {
  const greeting = getGreeting();
  return (
    <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: 2 }}>
      <CardContent>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} spacing={2}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.light', fontSize: 24 }}>
            {me ? getInitials(me.name) : 'U'}
          </Avatar>
          <Stack spacing={0.5} sx={{ flex: 1 }}>
            <Typography variant="h4">
              {greeting}, {me?.name ?? 'User'}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              {roleSummary?.primaryRole ?? ''}
              {roleSummary?.department ? ` — ${roleSummary.department}` : ''}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function QuickActionsWidget({ myPermissions, moduleTree }: { myPermissions: any; moduleTree: any }) {
  const navigate = useNavigate();

  const quickActions = useMemo(() => {
    if (!myPermissions) return [];
    const actions: { label: string; icon: string; moduleSlug: string }[] = [];

    myPermissions.projects.forEach((project: any) => {
      project.modules.forEach((mod: any) => {
        const treeModule = moduleTree?.find((tm: any) => tm.id === mod.id);
        if (!treeModule) return;
        const moduleSlug = treeModule.code?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') ?? '';

        mod.subModules.forEach((sm: any) => {
          sm.actions.forEach((a: any) => {
            if (!a.allowed) return;
            if (a.code === 'CREATE' || a.code === 'APPROVE') {
              const label = a.code === 'CREATE' ? `Create ${treeModule.name}` : 'Approvals';
              if (!actions.some((existing) => existing.label === label)) {
                actions.push({ label, icon: ACTION_ICONS[a.code], moduleSlug });
              }
            }
          });
        });
      });
    });

    return actions;
  }, [myPermissions, moduleTree]);

  if (quickActions.length === 0) return null;

  return (
    <Card>
      <CardHeader title="Quick Actions" />
      <CardContent>
        <Stack direction="row" flexWrap="wrap" spacing={1.5}>
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="contained"
              startIcon={<Iconify icon={action.icon} />}
              onClick={() => {
                navigate(action.label === 'Approvals' ? paths.dashboard.root : paths.dashboard.modules.dashboard(action.moduleSlug));
              }}
            >
              {action.label}
            </Button>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

function AccessibleModulesWidget({ myPermissions, moduleTree }: { myPermissions: any; moduleTree: any }) {
  const navigate = useNavigate();

  const accessibleModules = useMemo(() => {
    if (!moduleTree || !myPermissions) return [];
    const allowedModuleIds = new Set<number>();
    myPermissions.projects.forEach((project: any) => {
      project.modules.forEach((mod: any) => {
        if (mod.subModules.some((sm: any) => sm.actions.some((a: any) => a.allowed))) {
          allowedModuleIds.add(mod.id);
        }
      });
    });
    return moduleTree.filter((mod: any) => allowedModuleIds.has(mod.id));
  }, [moduleTree, myPermissions]);

  if (accessibleModules.length === 0) return null;

  return (
    <Card sx={{ height: 1 }}>
      <CardHeader title="Accessible Modules" />
      <CardContent>
        <Grid container spacing={2}>
          {accessibleModules.map((mod: any) => {
            const moduleSlug = (mod.code ?? mod.name).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            return (
              <Grid item xs={12} sm={6} md={4} key={mod.id}>
                <Card
                  variant="outlined"
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: 'primary.main', boxShadow: 1 },
                  }}
                  onClick={() => navigate(paths.dashboard.modules.dashboard(moduleSlug))}
                >
                  <CardContent>
                    <Stack spacing={1} alignItems="center" sx={{ py: 1 }}>
                      <Iconify icon="solar:folder-bold" width={32} color="primary.main" />
                      <Typography variant="subtitle1" textAlign="center">
                        {mod.name}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
    </Card>
  );
}

function RoleSummaryWidget({ me }: { me: any }) {
  const roleSummary = useMemo(() => {
    if (!me) return null;
    const primaryRoles = me.roles.filter((r: MeRole) => r.departmentId === me.departmentId);
    const otherRoles = me.roles.filter((r: MeRole) => r.departmentId !== me.departmentId);
    return {
      name: me.name,
      email: me.email,
      department: me.department,
      primaryRole: primaryRoles.length > 0 ? primaryRoles[0].roleName : me.roles[0]?.roleName ?? '-',
      secondaryRoles: otherRoles.map((r: MeRole) => r.roleName),
    };
  }, [me]);

  return (
    <Card sx={{ height: 1 }}>
      <CardHeader title="Role Summary" />
      <CardContent>
        {roleSummary ? (
          <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Name</Typography>
              <Typography variant="body2" fontWeight={600}>{roleSummary.name}</Typography>
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Email</Typography>
              <Typography variant="body2">{roleSummary.email}</Typography>
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Department</Typography>
              <Chip label={roleSummary.department} size="small" color="primary" variant="outlined" />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Primary Role</Typography>
              <Chip label={roleSummary.primaryRole} size="small" color="primary" />
            </Stack>
            {roleSummary.secondaryRoles.length > 0 && (
              <>
                <Divider />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Other Roles</Typography>
                  <Stack spacing={0.5} alignItems="flex-end">
                    {roleSummary.secondaryRoles.map((r: string) => (
                      <Chip key={r} label={r} size="small" variant="outlined" />
                    ))}
                  </Stack>
                </Stack>
              </>
            )}
          </Stack>
        ) : (
          <Typography color="text.secondary">Loading...</Typography>
        )}
      </CardContent>
    </Card>
  );
}

function RecentActivityWidget({ auditLogs, auditLoading }: { auditLogs: any; auditLoading: boolean }) {
  const recentAuditEntries = useMemo(() => {
    if (!auditLogs) return [];
    const logs = Array.isArray(auditLogs) ? auditLogs : (auditLogs as any).data ?? [];
    return logs.slice(0, 10);
  }, [auditLogs]);

  if (auditLoading) {
    return (
      <Card>
        <CardHeader title="Recent Activity" />
        <CardContent>
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
        </CardContent>
      </Card>
    );
  }

  if (recentAuditEntries.length === 0) return null;

  return (
    <Card>
      <CardHeader title="Recent Activity" />
      <CardContent>
        <Stack spacing={1}>
          {recentAuditEntries.map((log: any) => (
            <Card key={log.id} variant="outlined" sx={{ bgcolor: 'grey.50' }}>
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Iconify
                      icon={ACTION_ICONS[log.action as string] ?? 'solar:info-circle-bold'}
                      width={20}
                      color="text.secondary"
                    />
                    <Stack>
                      <Typography variant="body2" fontWeight={600}>
                        {log.entityName ?? log.entityType ?? '-'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {log.action} — {log.entityId ?? ''}
                      </Typography>
                    </Stack>
                  </Stack>
                  <Typography variant="caption" color="text.disabled">
                    {dayjs(log.createdAt).fromNow()}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

function MastersOverviewWidget() {
  const navigate = useNavigate();

  const masters = [
    { name: 'Zone Master', path: paths.dashboard.zoneMaster, icon: 'solar:map-point-bold' },
    { name: 'Brand Master', path: paths.dashboard.brandMaster, icon: 'solar:tag-bold' },
    { name: 'Department Master', path: paths.dashboard.departmentMaster, icon: 'solar:buildings-bold' },
    { name: 'Project Master', path: paths.dashboard.projectMaster, icon: 'solar:folder-bold' },
  ];

  return (
    <Card sx={{ height: 1 }}>
      <CardHeader title="Quick Navigation" />
      <CardContent>
        <Stack spacing={0.5}>
          {masters.map((mod) => (
            <Stack
              key={mod.name}
              direction="row"
              alignItems="center"
              spacing={1.5}
              sx={{
                py: 1,
                px: 1.5,
                borderRadius: 1,
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
              }}
              onClick={() => navigate(mod.path)}
            >
              <Iconify icon={mod.icon} width={20} color="primary.main" />
              <Typography variant="body2" fontWeight={500}>{mod.name}</Typography>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

function UserStatsWidget() {
  const navigate = useNavigate();

  return (
    <Card sx={{ height: 1 }}>
      <CardHeader title="User Management" />
      <CardContent>
        <Stack spacing={1.5}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<Iconify icon="solar:add-circle-bold" />}
            onClick={() => navigate(paths.dashboard.userNew)}
          >
            Create New User
          </Button>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<Iconify icon="solar:users-group-rounded-bold" />}
            onClick={() => navigate(paths.dashboard.userManagement)}
          >
            View All Users
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function DashboardView() {
  const { data: me, isLoading: meLoading } = useMe();
  const { data: myPermissions, isLoading: permissionsLoading } = useMyPermissions();
  const { data: moduleTree, isLoading: treeLoading } = useModuleTree();
  const { data: auditLogs, isLoading: auditLoading } = useAuditLogList(
    me?.empId ? { performedBy: me.empId, limit: 10, sortBy: 'createdAt', sortOrder: 'DESC' } : undefined,
  );

  const roleSummary = useMemo(() => {
    if (!me) return null;
    const primaryRoles = me.roles.filter((r: MeRole) => r.departmentId === me.departmentId);
    const otherRoles = me.roles.filter((r: MeRole) => r.departmentId !== me.departmentId);
    return {
      name: me.name,
      email: me.email,
      department: me.department,
      primaryRole: primaryRoles.length > 0 ? primaryRoles[0].roleName : me.roles[0]?.roleName ?? '-',
      secondaryRoles: otherRoles.map((r: MeRole) => r.roleName),
    };
  }, [me]);

  const hasUserModuleAccess = useMemo(() => {
    if (!myPermissions) return false;
    return myPermissions.projects.some((project: any) =>
      project.modules.some((mod: any) =>
        mod.subModules.some((sm: any) =>
          sm.name === 'USER_MANAGEMENT' && sm.actions.some((a: any) => a.allowed)
        )
      )
    );
  }, [myPermissions]);

  const isLoading = meLoading || permissionsLoading || treeLoading;

  if (isLoading) {
    return (
      <>
        <Helmet><title>Dashboard - {CONFIG.appName}</title></Helmet>
        <PageContainer>
          <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2, mb: 3 }} />
          <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2, mb: 3 }} />
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
            </Grid>
          </Grid>
        </PageContainer>
      </>
    );
  }

  const widgets: DashboardWidget[] = [
    {
      id: 'welcome',
      size: 'full',
      component: () => <WelcomeWidget me={me} roleSummary={roleSummary} />,
    },
    {
      id: 'quick-actions',
      size: 'full',
      component: () => <QuickActionsWidget myPermissions={myPermissions} moduleTree={moduleTree} />,
    },
    {
      id: 'accessible-modules',
      size: 'two-thirds',
      component: () => <AccessibleModulesWidget myPermissions={myPermissions} moduleTree={moduleTree} />,
    },
    {
      id: 'role-summary',
      size: 'third',
      component: () => <RoleSummaryWidget me={me} />,
    },
    {
      id: 'masters-overview',
      size: 'third',
      component: () => <MastersOverviewWidget />,
    },
    ...(hasUserModuleAccess ? [{
      id: 'user-stats' as const,
      size: 'third' as const,
      component: () => <UserStatsWidget />,
    }] : []),
    {
      id: 'recent-activity',
      size: 'full',
      component: () => <RecentActivityWidget auditLogs={auditLogs} auditLoading={auditLoading} />,
    },
  ];

  const gridWidgets = widgets.filter((w) => w.size !== 'full');
  const fullWidgets = widgets.filter((w) => w.size === 'full');

  return (
    <>
      <Helmet><title>Dashboard - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        {fullWidgets.map((widget) => {
          const rendered = widget.component();
          if (rendered === null) return null;
          return <Box key={widget.id} sx={{ mb: 3 }}>{rendered}</Box>;
        })}

        {gridWidgets.length > 0 && (
          <Grid container spacing={3}>
            {gridWidgets.map((widget) => {
              const rendered = widget.component();
              if (rendered === null) return null;

              const gridWidth = widget.size === 'two-thirds'
                ? { xs: 12, md: 8 }
                : widget.size === 'third'
                  ? { xs: 12, sm: 6, md: 4 }
                  : { xs: 12, md: 6 };

              return <Grid item key={widget.id} {...gridWidth}>{rendered}</Grid>;
            })}
          </Grid>
        )}
      </PageContainer>
    </>
  );
}
