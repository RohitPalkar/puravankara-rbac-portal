import type { MeRole } from 'src/services/types/auth';

import dayjs from 'dayjs';
import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  Bar,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  PieChart,
  ResponsiveContainer,
} from 'recharts';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { useMe } from 'src/services/hooks/use-auth';
import { useAuditLogList } from 'src/services/hooks/use-audit';
import { userService } from 'src/services/services/user.service';
import { useMyPermissions } from 'src/services/hooks/use-permissions';
import { useModuleTree } from 'src/services/hooks/use-product-catalog';
import { projectService } from 'src/services/services/project.service';
import { roleService, departmentService } from 'src/services/services/organization.service';

import { Iconify } from 'src/components/iconify';
import { PageContainer } from 'src/components/page-layout';

dayjs.extend(relativeTime);

const CHART_COLORS = ['#2F3C98', '#5B6ABF', '#8B9FE8', '#4CAF50', '#FF9800', '#E91E63', '#00BCD4', '#9C27B0'];

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

function groupAuditLogsByDate(logs: any[]): { date: string; count: number }[] {
  const map = new Map<string, number>();
  for (let i = 6; i >= 0; i -= 1) {
    const d = dayjs().subtract(i, 'day').format('MMM DD');
    map.set(d, 0);
  }
  logs.forEach((log) => {
    const d = dayjs(log.createdAt).format('MMM DD');
    if (map.has(d)) map.set(d, (map.get(d) ?? 0) + 1);
  });
  return Array.from(map.entries()).map(([date, count]) => ({ date, count }));
}

function WelcomeBar({ me }: { me: any }) {
  const greeting = getGreeting();
  return (
    <Card
      sx={{
        borderRadius: 2,
        background: (theme) =>
          `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 60%)`,
        color: 'primary.contrastText',
      }}
    >
      <CardContent sx={{ py: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: 'primary.light',
              fontSize: 18,
              border: '2px solid rgba(255,255,255,0.3)',
            }}
          >
            {me ? getInitials(me.name) : 'U'}
          </Avatar>
          <Stack spacing={0.25}>
            <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {greeting}, {me?.name ?? 'User'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {me?.roles?.length
                ? me.roles.map((r: MeRole) => r.roleName).join(', ')
                : ''}
              {me?.department ? ` · ${me.department}` : ''}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function KpiCard({ icon, label, value, color, loading }: { icon: string; label: string; value: number | string; color: string; loading: boolean }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 1.5 }}>
      <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: `${color}14`,
              }}
            >
              <Iconify icon={icon} width={18} sx={{ color }} />
            </Box>
            {loading ? (
              <Skeleton width={60} height={28} />
            ) : (
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {value}
              </Typography>
            )}
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
            {label}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

function ActivityChart({ auditLogs, loading }: { auditLogs: any; loading: boolean }) {
  const chartData = useMemo(() => {
    if (!auditLogs) return [];
    const logs = Array.isArray(auditLogs) ? auditLogs : (auditLogs as any).data ?? [];
    return groupAuditLogsByDate(logs);
  }, [auditLogs]);

  if (loading) {
    return (
      <Card variant="outlined" sx={{ borderRadius: 1.5, height: 1 }}>
        <CardContent><Skeleton variant="rectangular" height={220} sx={{ borderRadius: 1 }} /></CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) return null;

  return (
    <Card variant="outlined" sx={{ borderRadius: 1.5, height: 1 }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
          Activity (7 days)
        </Typography>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 13 }}
            />
            <Bar dataKey="count" fill="#2F3C98" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function ModulePieChart({ moduleTree }: { moduleTree: any }) {
  const chartData = useMemo(() => {
    if (!moduleTree?.length) return [];
    return moduleTree.map((mod: any) => ({
      name: mod.name,
      value: mod.subModules?.length ?? 0,
    }));
  }, [moduleTree]);

  if (chartData.length === 0) return null;

  return (
    <Card variant="outlined" sx={{ borderRadius: 1.5, height: 1 }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Sub-Modules per Module
        </Typography>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((_: any, i: number) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 13 }}
            />
          </PieChart>
        </ResponsiveContainer>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mt: 0.5 }}>
          {chartData.map((entry: any, i: number) => (
            <Stack key={entry.name} direction="row" spacing={0.5} alignItems="center">
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: CHART_COLORS[i % CHART_COLORS.length] }} />
              <Typography variant="caption" color="text.secondary">{entry.name}</Typography>
            </Stack>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

function QuickNavRow({ myPermissions, hasUserModuleAccess }: { myPermissions: any; hasUserModuleAccess: boolean }) {
  const navigate = useNavigate();

  const links = useMemo(() => {
    const items: { label: string; icon: string; path: string; visible: boolean }[] = [
      { label: 'Users', icon: 'solar:users-group-rounded-bold', path: paths.dashboard.userManagement, visible: hasUserModuleAccess },
      { label: 'Permissions', icon: 'solar:lock-bold', path: paths.dashboard.permissionMatrix, visible: true },
      { label: 'Audit Logs', icon: 'solar:clipboard-list-bold', path: paths.dashboard.auditLogs, visible: true },
      { label: 'Settings', icon: 'solar:settings-bold', path: paths.dashboard.settings, visible: true },
    ];
    return items.filter((i) => i.visible);
  }, [hasUserModuleAccess]);

  if (links.length === 0) return null;

  return (
    <Card variant="outlined" sx={{ borderRadius: 1.5 }}>
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <Iconify icon="solar:widget-bold" width={16} sx={{ color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Quick Navigation
          </Typography>
        </Stack>
        <Stack direction="row" flexWrap="wrap" spacing={1}>
          {links.map((link) => (
            <Stack
              key={link.label}
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{
                py: 0.75,
                px: 1.5,
                borderRadius: 1.5,
                cursor: 'pointer',
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.15s',
                '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.lighter' },
              }}
              onClick={() => navigate(link.path)}
            >
              <Iconify icon={link.icon} width={16} color="primary.main" />
              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>
                {link.label}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

function RecentActivityMini({ auditLogs, loading }: { auditLogs: any; loading: boolean }) {
  const entries = useMemo(() => {
    if (!auditLogs) return [];
    const logs = Array.isArray(auditLogs) ? auditLogs : (auditLogs as any).data ?? [];
    return logs.slice(0, 5);
  }, [auditLogs]);

  if (loading) {
    return (
      <Card variant="outlined" sx={{ borderRadius: 1.5 }}>
        <CardContent><Skeleton variant="rectangular" height={120} sx={{ borderRadius: 1 }} /></CardContent>
      </Card>
    );
  }

  if (entries.length === 0) return null;

  return (
    <Card variant="outlined" sx={{ borderRadius: 1.5 }}>
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <Iconify icon="solar:clock-circle-bold" width={16} sx={{ color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Recent Activity
          </Typography>
        </Stack>
        <Stack spacing={0.5}>
          {entries.map((log: any) => (
            <Stack key={log.id} direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.5 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0 }} />
                <Typography variant="body2" sx={{ fontSize: '0.8125rem' }} noWrap>
                  {log.entityName ?? log.entityType ?? '-'}
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0 }}>
                {dayjs(log.createdAt).fromNow()}
              </Typography>
            </Stack>
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
    me?.empId
      ? {
          performedBy: me.empId,
          limit: 50,
          sortBy: 'createdAt',
          sortOrder: 'DESC' as const,
        }
      : undefined,
  );

  const { data: userCount } = useQuery({
    queryKey: ['kpi', 'users'],
    queryFn: async () => {
      const res = await userService.list({ page: 1, limit: 1 });
      return res.meta?.total ?? 0;
    },
    staleTime: 120_000,
  });

  const { data: projectCount } = useQuery({
    queryKey: ['kpi', 'projects'],
    queryFn: async () => {
      const res = await projectService.list({ page: 1, limit: 1 });
      return res.meta?.total ?? 0;
    },
    staleTime: 120_000,
  });

  const { data: roleCount } = useQuery({
    queryKey: ['kpi', 'roles'],
    queryFn: async () => {
      const res = await roleService.list({ page: 1, limit: 1 });
      return res.meta?.total ?? 0;
    },
    staleTime: 120_000,
  });

  const { data: deptCount } = useQuery({
    queryKey: ['kpi', 'departments'],
    queryFn: async () => {
      const res = await departmentService.list({ page: 1, limit: 1 });
      return res.meta?.total ?? 0;
    },
    staleTime: 120_000,
  });

  const kpiLoading = userCount === undefined || projectCount === undefined || roleCount === undefined || deptCount === undefined;

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

  const isLoading = meLoading || permissionsLoading || treeLoading;

  if (isLoading) {
    return (
      <>
        <Helmet><title>Dashboard - {CONFIG.appName}</title></Helmet>
        <PageContainer>
          <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2, mb: 3 }} />
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[1, 2, 3, 4].map((i) => <Grid item xs={6} sm={3} key={i}><Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1.5 }} /></Grid>)}
          </Grid>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={7}><Skeleton variant="rectangular" height={260} sx={{ borderRadius: 1.5 }} /></Grid>
            <Grid item xs={12} md={5}><Skeleton variant="rectangular" height={260} sx={{ borderRadius: 1.5 }} /></Grid>
          </Grid>
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <Helmet><title>Dashboard - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        {/* Welcome Bar */}
        <Box sx={{ mb: 2.5 }}>
          <WelcomeBar me={me} />
        </Box>

        {/* KPI Row */}
        <Box sx={{ mb: 2.5 }}>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <KpiCard icon="solar:users-group-rounded-bold" label="Total Users" value={userCount ?? '-'} color="#2F3C98" loading={kpiLoading} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <KpiCard icon="solar:folder-bold" label="Total Projects" value={projectCount ?? '-'} color="#4CAF50" loading={kpiLoading} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <KpiCard icon="solar:user-id-bold" label="Total Roles" value={roleCount ?? '-'} color="#FF9800" loading={kpiLoading} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <KpiCard icon="solar:buildings-bold" label="Departments" value={deptCount ?? '-'} color="#00BCD4" loading={kpiLoading} />
            </Grid>
          </Grid>
        </Box>

        {/* Charts Row */}
        <Box sx={{ mb: 2.5 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={7}>
              <ActivityChart auditLogs={auditLogs} loading={auditLoading} />
            </Grid>
            <Grid item xs={12} md={5}>
              <ModulePieChart moduleTree={moduleTree} />
            </Grid>
          </Grid>
        </Box>

        {/* Quick Nav + Recent Activity */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={7}>
            <QuickNavRow myPermissions={myPermissions} hasUserModuleAccess={hasUserModuleAccess} />
          </Grid>
          <Grid item xs={12} md={5}>
            <RecentActivityMini auditLogs={auditLogs} loading={auditLoading} />
          </Grid>
        </Grid>
      </PageContainer>
    </>
  );
}
