import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { CONFIG } from 'src/config-global';
import { PageContainer } from 'src/components/page-layout';
import { Iconify } from 'src/components/iconify';
import { paths } from 'src/routes/paths';
import { useMe } from 'src/services/hooks/use-auth';
import { useMyPermissions } from 'src/services/hooks/use-permissions';
import { useModuleTree } from 'src/services/hooks/use-product-catalog';
import { useAuditLogList } from 'src/services/hooks/use-audit';
import type { MeRole } from 'src/services/types/auth';

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

export default function DashboardView() {
  const navigate = useNavigate();

  const { data: me, isLoading: meLoading } = useMe();
  const { data: myPermissions, isLoading: permissionsLoading } = useMyPermissions();
  const { data: moduleTree, isLoading: treeLoading } = useModuleTree();
  const { data: auditLogs, isLoading: auditLoading } = useAuditLogList(
    me?.empId ? { performedBy: me.empId, limit: 10, sortBy: 'createdAt', sortOrder: 'DESC' } : undefined,
  );

  const greeting = getGreeting();

  const allowedModuleIds = useMemo(() => {
    if (!myPermissions) return new Set<number>();
    const ids = new Set<number>();
    myPermissions.projects.forEach((project) => {
      project.modules.forEach((mod) => {
        if (mod.subModules.some((sm) => sm.actions.some((a) => a.allowed))) {
          ids.add(mod.id);
        }
      });
    });
    return ids;
  }, [myPermissions]);

  const accessibleModules = useMemo(() => {
    if (!moduleTree || !myPermissions) return [];
    return moduleTree.filter((mod) => allowedModuleIds.has(mod.id));
  }, [moduleTree, myPermissions, allowedModuleIds]);

  const quickActions = useMemo(() => {
    if (!myPermissions) return [];
    const actions: { label: string; icon: string; moduleCode: string; moduleSlug: string }[] = [];

    myPermissions.projects.forEach((project) => {
      project.modules.forEach((mod) => {
        const treeModule = moduleTree?.find((tm) => tm.id === mod.id);
        if (!treeModule) return;
        const moduleSlug = treeModule.code?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') ?? '';

        mod.subModules.forEach((sm) => {
          sm.actions.forEach((a) => {
            if (!a.allowed) return;
            if (a.code === 'CREATE' || a.code === 'APPROVE') {
              const label = a.code === 'CREATE' ? `Create ${treeModule.name}` : 'Approvals';
              if (!actions.some((existing) => existing.label === label)) {
                actions.push({
                  label,
                  icon: ACTION_ICONS[a.code],
                  moduleCode: treeModule.code ?? '',
                  moduleSlug,
                });
              }
            }
          });
        });
      });
    });

    return actions;
  }, [myPermissions, moduleTree]);

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
      allRoles: me.roles,
    };
  }, [me]);

  const recentAuditEntries = useMemo(() => {
    if (!auditLogs) return [];
    const logs = Array.isArray(auditLogs) ? auditLogs : (auditLogs as any).data ?? [];
    return logs.slice(0, 10);
  }, [auditLogs]);

  const isLoading = meLoading || permissionsLoading || treeLoading;

  if (isLoading) {
    return (
      <>
        <Helmet><title>Dashboard - {CONFIG.appName}</title></Helmet>
        <PageContainer>
          <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
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

  return (
    <>
      <Helmet><title>Dashboard - {CONFIG.appName}</title></Helmet>
      <PageContainer>
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

        {quickActions.length > 0 && (
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
                      if (action.label === 'Approvals') {
                        navigate(paths.dashboard.approvalInbox);
                      } else {
                        navigate(paths.dashboard.modules.new(action.moduleSlug));
                      }
                    }}
                  >
                    {action.label}
                  </Button>
                ))}
              </Stack>
            </CardContent>
          </Card>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ height: 1 }}>
              <CardHeader title="Accessible Modules" />
              <CardContent>
                {accessibleModules.length === 0 ? (
                  <Typography color="text.secondary">No modules available.</Typography>
                ) : (
                  <Grid container spacing={2}>
                    {accessibleModules.map((mod) => {
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
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
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
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardHeader title="Recent Activity" />
              <CardContent>
                {auditLoading ? (
                  <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
                ) : recentAuditEntries.length === 0 ? (
                  <Typography color="text.secondary">No recent activity.</Typography>
                ) : (
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
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </PageContainer>
    </>
  );
}
