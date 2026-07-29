import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { useDashboardKpis } from 'src/services/hooks/use-dashboard';

import { Iconify } from 'src/components/iconify';

interface Props {
  zoneId?: number;
}

export function SystemStatus({ zoneId }: Props) {
  const { data: kpis, isLoading } = useDashboardKpis(zoneId);

  const items = [
    { label: 'Active Users', value: kpis?.activeUsers ?? '-', icon: 'solar:user-check-bold', color: '#4CAF50' },
    { label: 'Active Projects', value: kpis?.totalProjects ?? '-', icon: 'solar:folder-check-bold', color: '#FF9800' },
    { label: 'Active Departments', value: kpis?.departments ?? '-', icon: 'solar:buildings-bold', color: '#00BCD4' },
  ];

  return (
    <Card variant="outlined" sx={{ borderRadius: 1.5, height: 1 }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Box sx={{ width: 28, height: 28, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'success.lighter' }}>
            <Iconify icon="solar:health-bold" width={16} color="success.main" />
          </Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>System Status</Typography>
        </Stack>

        {isLoading ? (
          <Stack spacing={1.5}>
            {[1, 2, 3].map((i) => <Skeleton key={i} height={48} sx={{ borderRadius: 1 }} />)}
          </Stack>
        ) : (
          <Stack spacing={1}>
            {items.map((item) => (
              <Stack
                key={item.label}
                direction="row"
                alignItems="center"
                spacing={1.5}
                sx={{
                  p: 1.25,
                  borderRadius: 1,
                  bgcolor: 'grey.50',
                }}
              >
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
                <Stack sx={{ flex: 1 }}>
                  <Typography variant="h5" fontWeight={700} lineHeight={1.2}>
                    {item.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.label}
                  </Typography>
                </Stack>
              </Stack>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
