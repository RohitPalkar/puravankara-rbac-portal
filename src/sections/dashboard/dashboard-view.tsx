import type { MeRole } from 'src/services/types/auth';

import dayjs from 'dayjs';
import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
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

type Persona = 'super-admin' | 'admin' | 'user';

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

function determinePersona(me: any, myPermissions: any): Persona {
  if (!me?.roles?.length) return 'user';

  const roleNames = me.roles.map((r: MeRole) => r.roleName.toLowerCase());
  const maxRank = Math.max(...me.roles.map((r: MeRole) => r.hierarchyLevelRank ?? 0));

  const isSuperAdmin =
    roleNames.some((n: string) => n.includes('super admin') || n.includes('superadmin')) ||
    maxRank >= 90;

  if (isSuperAdmin) return 'super-admin';

  const isAdmin =
    roleNames.some((n: string) =>
      ['admin', 'manager', 'approver', 'director', 'head'].some((kw) => n.includes(kw)),
    ) || maxRank >= 60;

  if (isAdmin) return 'admin';

  return 'user';
}

function hasAnyAllowedAction(
  myPermissions: any,
  predicate: (action: any) => boolean,
): boolean {
  if (!myPermissions) return false;
  return myPermissions.projects.some((project: any) =>
    project.modules.some((mod: any) =>
      mod.subModules.some((sm: any) => sm.actions.some((a: any) => predicate(a))),
    ),
  );
}

function computeStats(me: any, myPermissions: any, moduleTree: any) {
  if (!myPermissions || !moduleTree) return null;

  const allowedModuleIds = new Set<number>();
  myPermissions.projects.forEach((project: any) => {
    project.modules.forEach((mod: any) => {
      if (mod.subModules.some((sm: any) => sm.actions.some((a: any) => a.allowed))) {
        allowedModuleIds.add(mod.id);
      }
    });
  });

  const projectIds = new Set<number>();
  myPermissions.projects.forEach((p: any) => projectIds.add(p.id));

  const allActionTypes = new Set<string>();
  myPermissions.projects.forEach((project: any) => {
    project.modules.forEach((mod: any) => {
      mod.subModules.forEach((sm: any) => {
        sm.actions.forEach((a: any) => {
          if (a.allowed) allActionTypes.add(a.code);
        });
      });
    });
  });

  return {
    accessibleModuleCount: allowedModuleIds.size,
    totalProjectCount: projectIds.size,
    roleCount: me?.roles?.length ?? 0,
    actionTypeCount: allActionTypes.size,
  };
}

function WelcomeBanner({ me, persona }: { me: any; persona: Persona }) {
  const greeting = getGreeting();
  const personaLabel =
    persona === 'super-admin' ? 'Super Administrator'
    : persona === 'admin' ? 'Administrator'
    : 'Team Member';

  return (
    <Card
      sx={{
        borderRadius: 2,
        background: (theme) =>
          `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.primary.light} 100%)`,
        color: 'primary.contrastText',
        position: 'relative',
        overflow: 'hidden',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        },
      }}
    >
      <CardContent sx={{ position: 'relative', zIndex: 1 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} spacing={2.5}>
          <Avatar
            sx={{
              width: 72,
              height: 72,
              bgcolor: 'primary.light',
              fontSize: 28,
              border: '3px solid rgba(255,255,255,0.3)',
            }}
          >
            {me ? getInitials(me.name) : 'U'}
          </Avatar>
          <Stack spacing={0.5} sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {greeting}, {me?.name ?? 'User'}
            </Typography>
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {personaLabel}
              </Typography>
              {me?.department && (
                <>
                  <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.5)' }} />
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    {me.department}
                  </Typography>
                </>
              )}
              {me?.email && (
                <>
                  <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.5)' }} />
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    {me.email}
                  </Typography>
                </>
              )}
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function StatCardsRow({ stats }: { stats: any }) {
  if (!stats) return null;
  const items = [
    { label: 'Accessible Modules', value: stats.accessibleModuleCount, icon: 'solar:folder-bold', color: 'primary.main' },
    { label: 'Active Projects', value: stats.totalProjectCount, icon: 'solar:buildings-bold', color: 'success.main' },
    { label: 'Assigned Roles', value: stats.roleCount, icon: 'solar:user-id-bold', color: 'warning.main' },
    { label: 'Action Types Available', value: stats.actionTypeCount, icon: 'solar:flash-bold', color: 'info.main' },
  ];

  return (
    <Grid container spacing={2.5}>
      {items.map((item) => (
        <Grid item xs={6} sm={3} key={item.label}>
          <Card variant="outlined" sx={{ borderRadius: 1.5 }}>
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: `${item.color}14`,
                    }}
                  >
                    <Iconify icon={item.icon} width={18} sx={{ color: item.color }} />
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {item.value}
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {item.label}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'primary.lighter',
        }}
      >
        <Iconify icon={icon} width={18} sx={{ color: 'primary.main' }} />
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
    </Stack>
  );
}

function SystemOverviewSection({ myPermissions, hasUserModuleAccess }: { myPermissions: any; hasUserModuleAccess: boolean }) {
  const navigate = useNavigate();

  const overviewCards = useMemo(() => {
    const cards: { label: string; icon: string; description: string; path: string; visible: boolean }[] = [
      {
        label: 'User Management',
        icon: 'solar:users-group-rounded-bold',
        description: 'Manage users, roles, and access permissions',
        path: paths.dashboard.userManagement,
        visible: hasUserModuleAccess,
      },
      {
        label: 'Permission Matrix',
        icon: 'solar:lock-bold',
        description: 'Configure module and action permissions',
        path: paths.dashboard.permissionMatrix,
        visible: true,
      },
      {
        label: 'Audit Logs',
        icon: 'solar:clipboard-list-bold',
        description: 'Review system activity and changes',
        path: paths.dashboard.auditLogs,
        visible: true,
      },
      {
        label: 'Settings',
        icon: 'solar:settings-bold',
        description: 'System configuration and preferences',
        path: paths.dashboard.settings,
        visible: true,
      },
      {
        label: 'Zone Master',
        icon: 'solar:map-point-bold',
        description: 'Manage geographic zones',
        path: paths.dashboard.zoneMaster,
        visible: true,
      },
      {
        label: 'Department Master',
        icon: 'solar:buildings-bold',
        description: 'Manage departments and hierarchy',
        path: paths.dashboard.departmentMaster,
        visible: true,
      },
    ];
    return cards.filter((c) => c.visible);
  }, [hasUserModuleAccess]);

  if (overviewCards.length === 0) return null;

  return (
    <Box sx={{ mb: 4 }}>
      <SectionHeader icon="solar:widget-bold" title="System Overview" />
      <Grid container spacing={2.5}>
        {overviewCards.map((card) => (
          <Grid item xs={12} sm={6} md={4} key={card.label}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 1.5,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { borderColor: 'primary.main', boxShadow: (t) => `0 0 0 2px ${t.palette.primary.lighter}` },
              }}
              onClick={() => navigate(card.path)}
            >
              <CardContent>
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'primary.lighter',
                      flexShrink: 0,
                    }}
                  >
                    <Iconify icon={card.icon} width={20} sx={{ color: 'primary.main' }} />
                  </Box>
                  <Stack spacing={0.25}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {card.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {card.description}
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

function OperationsHubSection({ myPermissions, moduleTree }: { myPermissions: any; moduleTree: any }) {
  const navigate = useNavigate();

  const quickActions = useMemo(() => {
    if (!myPermissions) return [];
    const actions: { label: string; icon: string; moduleSlug: string }[] = [];

    myPermissions.projects.forEach((project: any) => {
      project.modules.forEach((mod: any) => {
        const treeModule = moduleTree?.find((tm: any) => tm.id === mod.id);
        if (!treeModule) return;
        const moduleSlug =
          treeModule.code?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') ?? '';

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

  const pendingApprovals = useMemo(() => {
    if (!myPermissions) return false;
    return hasAnyAllowedAction(myPermissions, (a) => a.code === 'APPROVE' && a.allowed);
  }, [myPermissions]);

  const hasQuickActions = quickActions.length > 0;
  const showOperations = hasQuickActions || pendingApprovals;

  if (!showOperations) return null;

  return (
    <Box sx={{ mb: 4 }}>
      <SectionHeader icon="solar:flash-bold" title="Operations Hub" />
      <Grid container spacing={2.5}>
        {hasQuickActions && (
          <Grid item xs={12} md={pendingApprovals ? 7 : 12}>
            <Card variant="outlined" sx={{ borderRadius: 1.5, height: 1 }}>
              <CardHeader title="Quick Actions" sx={{ '& .MuiCardHeader-title': { typography: 'subtitle2', fontWeight: 600 } }} />
              <CardContent>
                <Stack direction="row" flexWrap="wrap" spacing={1.5}>
                  {quickActions.map((action) => (
                    <Button
                      key={action.label}
                      variant="contained"
                      startIcon={<Iconify icon={action.icon} />}
                      onClick={() => {
                        navigate(
                          action.label === 'Approvals'
                            ? paths.dashboard.root
                            : paths.dashboard.modules.dashboard(action.moduleSlug),
                        );
                      }}
                      sx={{ borderRadius: 1.5 }}
                    >
                      {action.label}
                    </Button>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )}
        {pendingApprovals && (
          <Grid item xs={12} md={hasQuickActions ? 5 : 12}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 1.5,
                height: 1,
                borderColor: 'warning.light',
                bgcolor: 'warning.lighter',
              }}
            >
              <CardContent>
                <Stack spacing={1.5} alignItems="center" sx={{ py: 1 }}>
                  <Iconify icon="solar:clock-circle-bold" width={40} sx={{ color: 'warning.main' }} />
                  <Typography variant="subtitle2" textAlign="center">
                    You have pending approvals
                  </Typography>
                  <Typography variant="caption" color="text.secondary" textAlign="center">
                    Items awaiting your review and decision
                  </Typography>
                  <Button
                    variant="contained"
                    color="warning"
                    size="small"
                    startIcon={<Iconify icon="solar:eye-bold" />}
                    sx={{ borderRadius: 1.5 }}
                  >
                    Review Approvals
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
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
    <Card variant="outlined" sx={{ borderRadius: 1.5, height: 1 }}>
      <CardHeader
        title="Accessible Modules"
        sx={{ '& .MuiCardHeader-title': { typography: 'subtitle2', fontWeight: 600 } }}
      />
      <CardContent>
        <Grid container spacing={1.5}>
          {accessibleModules.map((mod: any) => {
            const moduleSlug = (mod.code ?? mod.name)
              .toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[^a-z0-9-]/g, '');
            return (
              <Grid item xs={12} sm={6} key={mod.id}>
                <Card
                  variant="outlined"
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    borderColor: 'divider',
                    '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.lighter' },
                  }}
                  onClick={() => navigate(paths.dashboard.modules.dashboard(moduleSlug))}
                >
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Iconify icon="solar:folder-bold" width={22} color="primary.main" />
                      <Typography variant="body2" fontWeight={600}>
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
    <Card variant="outlined" sx={{ borderRadius: 1.5, height: 1 }}>
      <CardHeader
        title="Role Summary"
        sx={{ '& .MuiCardHeader-title': { typography: 'subtitle2', fontWeight: 600 } }}
      />
      <CardContent>
        {roleSummary ? (
          <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">Name</Typography>
              <Typography variant="body2" fontWeight={600}>{roleSummary.name}</Typography>
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">Email</Typography>
              <Typography variant="body2">{roleSummary.email}</Typography>
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">Department</Typography>
              <Chip label={roleSummary.department} size="small" color="primary" variant="outlined" />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">Primary Role</Typography>
              <Chip label={roleSummary.primaryRole} size="small" color="primary" />
            </Stack>
            {roleSummary.secondaryRoles.length > 0 && (
              <>
                <Divider />
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Typography variant="body2" color="text.secondary" sx={{ pt: 0.5 }}>Other Roles</Typography>
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
      <Card variant="outlined" sx={{ borderRadius: 1.5 }}>
        <CardHeader
          title="Recent Activity"
          sx={{ '& .MuiCardHeader-title': { typography: 'subtitle2', fontWeight: 600 } }}
        />
        <CardContent>
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
        </CardContent>
      </Card>
    );
  }

  if (recentAuditEntries.length === 0) return null;

  return (
    <Card variant="outlined" sx={{ borderRadius: 1.5 }}>
      <CardHeader
        title="Recent Activity"
        sx={{ '& .MuiCardHeader-title': { typography: 'subtitle2', fontWeight: 600 } }}
      />
      <CardContent>
        <Stack spacing={1}>
          {recentAuditEntries.map((log: any) => (
            <Card key={log.id} variant="outlined" sx={{ bgcolor: 'grey.50', borderRadius: 1 }}>
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

export default function DashboardView() {
  const { data: me, isLoading: meLoading } = useMe();
  const { data: myPermissions, isLoading: permissionsLoading } = useMyPermissions();
  const { data: moduleTree, isLoading: treeLoading } = useModuleTree();
  const { data: auditLogs, isLoading: auditLoading } = useAuditLogList(
    me?.empId ? { performedBy: me.empId, limit: 10, sortBy: 'createdAt', sortOrder: 'DESC' } : undefined,
  );

  const persona = useMemo(() => determinePersona(me, myPermissions), [me, myPermissions]);

  const hasUserModuleAccess = useMemo(() => {
    if (!myPermissions) return false;
    return myPermissions.projects.some((project: any) =>
      project.modules.some((mod: any) =>
        mod.subModules.some(
          (sm: any) =>
            sm.name === 'USER_MANAGEMENT' && sm.actions.some((a: any) => a.allowed),
        ),
      ),
    );
  }, [myPermissions]);

  const stats = useMemo(() => computeStats(me, myPermissions, moduleTree), [me, myPermissions, moduleTree]);

  const isLoading = meLoading || permissionsLoading || treeLoading;

  if (isLoading) {
    return (
      <>
        <Helmet>
          <title>Dashboard - {CONFIG.appName}</title>
        </Helmet>
        <PageContainer>
          <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2, mb: 3 }} />
          <Grid container spacing={2.5} sx={{ mb: 4 }}>
            {[1, 2, 3, 4].map((i) => (
              <Grid item xs={6} sm={3} key={i}>
                <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 1.5 }} />
              </Grid>
            ))}
          </Grid>
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1.5, mb: 3 }} />
          <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 1.5 }} />
        </PageContainer>
      </>
    );
  }

  const showSystemOverview = persona === 'super-admin';
  const showOperationsHub = persona === 'super-admin' || persona === 'admin';
  const showMyWorkspace = true;

  return (
    <>
      <Helmet>
        <title>Dashboard - {CONFIG.appName}</title>
      </Helmet>
      <PageContainer>
        {/* Persona context chip */}
        {persona !== 'user' && (
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Chip
              icon={<Iconify icon={persona === 'super-admin' ? 'solar:crown-bold' : 'solar:shield-check-bold'} width={16} />}
              label={persona === 'super-admin' ? 'Super Admin Access' : 'Administrator Access'}
              color={persona === 'super-admin' ? 'error' : 'warning'}
              size="small"
              variant="soft"
            />
          </Stack>
        )}

        {/* Welcome Banner */}
        <Box sx={{ mb: 3 }}>
          <WelcomeBanner me={me} persona={persona} />
        </Box>

        {/* Quick Stats Bar */}
        {stats && (
          <Box sx={{ mb: 4 }}>
            <StatCardsRow stats={stats} />
          </Box>
        )}

        {/* Section: System Overview (super-admin only) */}
        {showSystemOverview && (
          <SystemOverviewSection myPermissions={myPermissions} hasUserModuleAccess={hasUserModuleAccess} />
        )}

        {/* Section: Operations Hub (super-admin + admin) */}
        {showOperationsHub && (
          <OperationsHubSection myPermissions={myPermissions} moduleTree={moduleTree} />
        )}

        {/* Section: My Workspace (everyone) */}
        {showMyWorkspace && (
          <Box sx={{ mb: 4 }}>
            <SectionHeader icon="solar:widget-5-bold" title="My Workspace" />
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={7}>
                <AccessibleModulesWidget myPermissions={myPermissions} moduleTree={moduleTree} />
              </Grid>
              <Grid item xs={12} md={5}>
                <RoleSummaryWidget me={me} />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Section: Recent Activity (everyone) */}
        <Box sx={{ mb: 2 }}>
          <SectionHeader icon="solar:clock-circle-bold" title="Recent Activity" />
          <RecentActivityWidget auditLogs={auditLogs} auditLoading={auditLoading} />
        </Box>
      </PageContainer>
    </>
  );
}
