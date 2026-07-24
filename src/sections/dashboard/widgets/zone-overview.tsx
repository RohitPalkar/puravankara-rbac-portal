import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { useDashboardZoneOverview } from 'src/services/hooks/use-dashboard';

const ZONE_COLORS = ['#2F3C98', '#4CAF50', '#FF9800', '#00BCD4', '#E91E63', '#9C27B0', '#795548', '#607D8B'];

export function ZoneOverview() {
  const { data: zones, isLoading } = useDashboardZoneOverview();

  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {[1, 2, 3, 4].map((i) => (
          <Grid item xs={6} md={3} key={i}>
            <Card variant="outlined" sx={{ borderRadius: 1.5, height: 1 }}>
              <CardContent><Skeleton variant="rectangular" height={100} sx={{ borderRadius: 1 }} /></CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!zones?.length) {
    return (
      <Card variant="outlined" sx={{ borderRadius: 1.5 }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary" textAlign="center">No zones configured yet.</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Grid container spacing={2}>
      {zones.map((zone, index) => (
        <Grid item xs={6} md={3} key={zone.id}>
          <Card variant="outlined" sx={{ borderRadius: 1.5, height: 1 }}>
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
              <Stack spacing={1.5}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: ZONE_COLORS[index % ZONE_COLORS.length], flexShrink: 0 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{zone.name}</Typography>
                </Stack>
                <Stack spacing={0.75}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">Users</Typography>
                    <Typography variant="body2" fontWeight={600}>{zone.user_count}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">Projects</Typography>
                    <Typography variant="body2" fontWeight={600}>{zone.project_count}</Typography>
                  </Stack>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
