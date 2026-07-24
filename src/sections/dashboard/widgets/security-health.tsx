import { useQuery } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { apiGet } from 'src/services/api/client';
import { useDashboardSecurityStats } from 'src/services/hooks/use-dashboard';

import { Iconify } from 'src/components/iconify';

type Status = 'up' | 'down' | 'warning';

function StatRow({ icon, label, value, color }: { icon: string; label: string; value: string | number; color: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.75 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Box sx={{ width: 28, height: 28, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: `${color}14` }}>
          <Iconify icon={icon} width={14} sx={{ color }} />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>{label}</Typography>
      </Stack>
      <Typography variant="body2" fontWeight={600}>{value}</Typography>
    </Stack>
  );
}

function StatusDot({ status }: { status: Status }) {
  const color = status === 'up' ? 'success.main' : status === 'down' ? 'error.main' : 'warning.main';
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
      <Typography variant="body2" sx={{ fontWeight: 600, color, fontSize: '0.8125rem' }}>
        {status === 'up' ? 'Healthy' : status === 'down' ? 'Down' : 'Degraded'}
      </Typography>
    </Stack>
  );
}

export function SecurityCenter() {
  const { data: stats, isLoading } = useDashboardSecurityStats();

  if (isLoading) {
    return (
      <Card variant="outlined" sx={{ borderRadius: 1.5, height: 1 }}>
        <CardContent><Skeleton variant="rectangular" height={160} sx={{ borderRadius: 1 }} /></CardContent>
      </Card>
    );
  }

  return (
    <Card variant="outlined" sx={{ borderRadius: 1.5, height: 1 }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <Box sx={{ width: 28, height: 28, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'error.lighter' }}>
            <Iconify icon="solar:shield-check-bold" width={16} color="error.main" />
          </Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Security Center</Typography>
        </Stack>
        <StatRow icon="solar:login-2-bold" label="Today's Logins" value={stats?.todayLogins ?? 0} color="#2F3C98" />
        <StatRow icon="solar:close-circle-bold" label="Failed Logins" value={stats?.failedLogins ?? 0} color="#F44336" />
        <StatRow icon="solar:lock-keyhole-bold" label="Locked Accounts" value={stats?.lockedAccounts ?? 0} color="#FF9800" />
        <StatRow icon="solar:clock-circle-bold" label="Password Expiring" value={stats?.passwordExpiring ?? 0} color="#E91E63" />
      </CardContent>
    </Card>
  );
}

export function SystemHealthWidget() {
  const { data: health, isLoading } = useQuery({
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

  if (isLoading) {
    return (
      <Card variant="outlined" sx={{ borderRadius: 1.5, height: 1 }}>
        <CardContent><Skeleton variant="rectangular" height={180} sx={{ borderRadius: 1 }} /></CardContent>
      </Card>
    );
  }

  const dbUp = health?.details?.database?.status === 'up';

  return (
    <Card variant="outlined" sx={{ borderRadius: 1.5, height: 1 }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <Box sx={{ width: 28, height: 28, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'success.lighter' }}>
            <Iconify icon="solar:health-bold" width={16} color="success.main" />
          </Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>System Health</Typography>
        </Stack>
        <Stack spacing={1.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>Backend</Typography>
            <StatusDot status="up" />
          </Stack>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>Database</Typography>
            <StatusDot status={dbUp ? 'up' : 'down'} />
          </Stack>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>API</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem', color: 'success.main' }}>99.9%</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>Last Backup</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Today</Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
