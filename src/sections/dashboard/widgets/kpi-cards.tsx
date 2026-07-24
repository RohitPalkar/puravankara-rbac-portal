import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { useDashboardKpis } from 'src/services/hooks/use-dashboard';

import { Iconify } from 'src/components/iconify';

interface KpiItem {
  icon: string;
  label: string;
  value: number | string;
  color: string;
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

export function KpiCards() {
  const { data: kpis, isLoading } = useDashboardKpis();

  const items: KpiItem[] = [
    { icon: 'solar:users-group-rounded-bold', label: 'Total Users', value: kpis?.totalUsers ?? '-', color: '#2F3C98' },
    { icon: 'solar:user-check-bold', label: 'Active Users', value: kpis?.activeUsers ?? '-', color: '#4CAF50' },
    { icon: 'solar:folder-bold', label: 'Projects', value: kpis?.totalProjects ?? '-', color: '#FF9800' },
    { icon: 'solar:buildings-bold', label: 'Departments', value: kpis?.departments ?? '-', color: '#00BCD4' },
    { icon: 'solar:user-id-bold', label: 'Permission Profiles', value: kpis?.permissionProfiles ?? '-', color: '#9C27B0' },
    { icon: 'solar:clipboard-check-bold', label: "Today's Events", value: kpis?.todayEvents ?? '-', color: '#E91E63' },
  ];

  return (
    <Grid container spacing={2}>
      {items.map((item) => (
        <Grid item xs={6} sm={4} md={2} key={item.label}>
          <KpiCard item={item} loading={isLoading} />
        </Grid>
      ))}
    </Grid>
  );
}
