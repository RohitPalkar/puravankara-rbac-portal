import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

import { apiGet } from 'src/services/api/client';
import { useDashboardSystemInfo, useDashboardSecurityStats } from 'src/services/hooks/use-dashboard';

import { Iconify } from 'src/components/iconify';

type Status = 'up' | 'down' | 'warning';

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string | number; color: string }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 1.5, p: 1.5, bgcolor: `${color}06`, borderColor: `${color}30`, flex: 1 }}>
      <Stack spacing={0.75} alignItems="center" textAlign="center">
        <Box sx={{ width: 32, height: 32, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: `${color}14` }}>
          <Iconify icon={icon} width={16} sx={{ color }} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 700, color, lineHeight: 1.1 }}>{value}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, lineHeight: 1.2 }}>{label}</Typography>
      </Stack>
    </Paper>
  );
}

function StatusDot({ status }: { status: Status }) {
  const color = status === 'up' ? 'success.main' : status === 'down' ? 'error.main' : 'warning.main';
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8125rem' }}>
        {status === 'up' ? 'Healthy' : status === 'down' ? 'Down' : 'Degraded'}
      </Typography>
    </Stack>
  );
}

function HealthRow({ label, value, icon, color }: { label: string; value: React.ReactNode; icon: string; color: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.75, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 0 } }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Box sx={{ width: 24, height: 24, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: `${color}14` }}>
          <Iconify icon={icon} width={13} sx={{ color }} />
        </Box>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
      </Stack>
      {typeof value === 'string' || typeof value === 'number' ? (
        <Typography variant="body2" fontWeight={600}>{value}</Typography>
      ) : value}
    </Stack>
  );
}

export function SecurityCenter() {
  const { data: stats, isLoading } = useDashboardSecurityStats();

  if (isLoading) {
    return (
      <Paper variant="outlined" sx={{ borderRadius: 2, p: 2, height: 1 }}>
        <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 1 }} />
      </Paper>
    );
  }

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, p: 2.5, height: 1 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Box sx={{ width: 32, height: 32, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'error.lighter' }}>
          <Iconify icon="solar:shield-check-bold" width={18} color="error.main" />
        </Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Security Center</Typography>
      </Stack>
      <Grid container spacing={1.5}>
        <Grid item xs={6}>
          <StatCard icon="solar:login-2-bold" label="Today's Logins" value={stats?.todayLogins ?? 0} color="#2F3C98" />
        </Grid>
        <Grid item xs={6}>
          <StatCard icon="solar:close-circle-bold" label="Failed Logins" value={stats?.failedLogins ?? 0} color="#F44336" />
        </Grid>
        <Grid item xs={6}>
          <StatCard icon="solar:lock-keyhole-bold" label="Locked Accounts" value={stats?.lockedAccounts ?? 0} color="#FF9800" />
        </Grid>
        <Grid item xs={6}>
          <StatCard icon="solar:clock-circle-bold" label="Password Expiring" value={stats?.passwordExpiring ?? 0} color="#E91E63" />
        </Grid>
      </Grid>
    </Paper>
  );
}

export function SystemHealthWidget() {
  const { data: health, isLoading: healthLoading } = useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      try {
        const res = await apiGet<any>('/api/v1/health');
        return res.data;
      } catch {
        return null;
      }
    },
    staleTime: 60_000,
  });

  const { data: sysInfo, isLoading: sysInfoLoading } = useDashboardSystemInfo();

  const isLoading = healthLoading || sysInfoLoading;

  if (isLoading) {
    return (
      <Paper variant="outlined" sx={{ borderRadius: 2, p: 2, height: 1 }}>
        <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 1 }} />
      </Paper>
    );
  }

  const dbUp = health?.details?.database?.status === 'up';
  const backendStatus: Status = sysInfo?.backendStatus === 'up' ? 'up' : 'down';
  const uptimeDisplay = sysInfo?.uptimeFormatted ?? '99.9%';

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, p: 2.5, height: 1 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Box sx={{ width: 32, height: 32, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'success.lighter' }}>
          <Iconify icon="solar:health-bold" width={18} color="success.main" />
        </Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>System Health</Typography>
      </Stack>
      <Stack spacing={0.5}>
        <HealthRow label="Backend" icon="solar:server-bold" color="#4CAF50" value={<StatusDot status={backendStatus} />} />
        <HealthRow label="Database" icon="solar:database-bold" color="#2F3C98" value={<StatusDot status={dbUp ? 'up' : 'down'} />} />
        <HealthRow label="API Uptime" icon="solar:chart-bold" color="#FF9800" value={uptimeDisplay} />
        <HealthRow label="Started" icon="solar:clock-circle-bold" color="#9C27B0" value={sysInfo?.backendStartTime ? dayjs(sysInfo.backendStartTime).format('HH:mm') : 'Today'} />
      </Stack>
    </Paper>
  );
}
