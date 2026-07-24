
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';


const ZONES = [
  { name: 'West', users: 84, projects: 12, color: '#2F3C98' },
  { name: 'South', users: 112, projects: 18, color: '#4CAF50' },
  { name: 'North', users: 46, projects: 6, color: '#FF9800' },
  { name: 'East', users: 44, projects: 5, color: '#00BCD4' },
];

export function ZoneOverview() {
  return (
    <Grid container spacing={2}>
      {ZONES.map((zone) => (
        <Grid item xs={6} md={3} key={zone.name}>
          <Card variant="outlined" sx={{ borderRadius: 1.5, height: 1 }}>
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
              <Stack spacing={1.5}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: zone.color, flexShrink: 0 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{zone.name}</Typography>
                </Stack>
                <Stack spacing={0.75}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">Users</Typography>
                    <Typography variant="body2" fontWeight={600}>{zone.users}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">Projects</Typography>
                    <Typography variant="body2" fontWeight={600}>{zone.projects}</Typography>
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
