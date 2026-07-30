import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

import { useDashboardKpis } from 'src/services/hooks/use-dashboard';

import { Iconify } from 'src/components/iconify';

interface Props {
  zoneId?: number;
}

export function SystemStatus({ zoneId }: Props) {
  const { data: kpis, isLoading } = useDashboardKpis(zoneId);

  const items = [
    { label: 'Active Users', value: kpis?.activeUsers ?? '-', icon: 'solar:user-check-bold', color: '#4CAF50', sub: 'Currently active in system' },
    { label: 'Active Projects', value: kpis?.totalProjects ?? '-', icon: 'solar:folder-check-bold', color: '#FF9800', sub: 'Ongoing construction projects' },
    { label: 'Active Departments', value: kpis?.departments ?? '-', icon: 'solar:buildings-bold', color: '#00BCD4', sub: 'Operational departments' },
    { label: 'Today Events', value: kpis?.todayEvents ?? '-', icon: 'solar:clock-circle-bold', color: '#E91E63', sub: 'Activities recorded today' },
  ];

  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {[1, 2, 3, 4].map((i) => (
          <Grid item xs={6} md={3} key={i}>
            <Paper variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
              <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1 }} />
            </Paper>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={2}>
      {items.map((item) => (
        <Grid item xs={6} md={3} key={item.label}>
          <Paper
            variant="outlined"
            sx={{
              borderRadius: 2,
              p: 2,
              transition: 'all 0.2s ease',
              '&:hover': { borderColor: item.color, bgcolor: `${item.color}08` },
            }}
          >
            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box sx={{ width: 36, height: 36, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: `${item.color}14` }}>
                  <Iconify icon={item.icon} width={18} sx={{ color: item.color }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: item.color, lineHeight: 1 }}>
                  {item.value}
                </Typography>
              </Stack>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                  {item.label}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: 'block' }}>
                  {item.sub}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
