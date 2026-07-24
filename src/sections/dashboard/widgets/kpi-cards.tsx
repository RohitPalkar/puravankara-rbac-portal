import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { userService } from 'src/services/services/user.service';
import { auditService } from 'src/services/services/audit.service';
import { projectService } from 'src/services/services/project.service';
import { roleService, departmentService } from 'src/services/services/organization.service';

import { Iconify } from 'src/components/iconify';

interface KpiItem {
  icon: string;
  label: string;
  value: number | string;
  color: string;
  trend: string;
  trendUp: boolean;
}

function KpiCard({ item, loading }: { item: KpiItem; loading: boolean }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 1.5 }}>
      <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
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
            {!loading && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Iconify
                  icon={item.trendUp ? 'solar:chart-2-bold' : 'solar:chart-down-bold'}
                  width={14}
                  sx={{ color: item.trendUp ? 'success.main' : 'error.main' }}
                />
                <Typography variant="caption" sx={{ fontWeight: 600, color: item.trendUp ? 'success.main' : 'error.main' }}>
                  {item.trend}
                </Typography>
              </Stack>
            )}
          </Stack>
          {loading ? (
            <Skeleton width={80} height={32} />
          ) : (
            <Typography variant="h3" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
              {item.value}
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
            {item.label}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

export function KpiCards({ me }: { me: any }) {
  const { data: userCount } = useQuery({
    queryKey: ['kpi', 'users'],
    queryFn: async () => {
      const res = await userService.list({ page: 1, limit: 1 });
      return { total: res.meta?.total ?? 0, active: 0 };
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

  const { data: deptCount } = useQuery({
    queryKey: ['kpi', 'departments'],
    queryFn: async () => {
      const res = await departmentService.list({ page: 1, limit: 1 });
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

  const { data: auditToday } = useQuery({
    queryKey: ['kpi', 'audit-today'],
    queryFn: async () => {
      const today = dayjs().format('YYYY-MM-DD');
      const res = await auditService.list({
        startDate: today,
        endDate: today,
        limit: 1,
      });
      return res.meta?.total ?? 0;
    },
    staleTime: 60_000,
  });

  const items: KpiItem[] = [
    { icon: 'solar:users-group-rounded-bold', label: 'Total Users', value: userCount?.total ?? '-', color: '#2F3C98', trend: userCount ? '+12 this month' : '-', trendUp: true },
    { icon: 'solar:user-check-bold', label: 'Active Users', value: userCount?.active ?? '-', color: '#4CAF50', trend: '84% Active', trendUp: true },
    { icon: 'solar:folder-bold', label: 'Projects', value: projectCount ?? '-', color: '#FF9800', trend: '+3 New', trendUp: true },
    { icon: 'solar:buildings-bold', label: 'Departments', value: deptCount ?? '-', color: '#00BCD4', trend: '6 Active', trendUp: true },
    { icon: 'solar:user-id-bold', label: 'Permission Profiles', value: roleCount ?? '-', color: '#9C27B0', trend: '18 Profiles', trendUp: false },
    { icon: 'solar:clipboard-check-bold', label: "Today's Events", value: auditToday ?? '-', color: '#E91E63', trend: 'Audit Events', trendUp: true },
  ];

  const loading = !userCount || !projectCount || !deptCount || !roleCount || auditToday === undefined;

  return (
    <Grid container spacing={2}>
      {items.map((item) => (
        <Grid item xs={6} sm={4} md={2} key={item.label}>
          <KpiCard item={item} loading={loading} />
        </Grid>
      ))}
    </Grid>
  );
}
