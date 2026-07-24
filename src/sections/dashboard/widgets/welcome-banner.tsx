import type { MeRole } from 'src/services/types/auth';

import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { Iconify } from 'src/components/iconify';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

interface Props {
  me: any;
}

export function WelcomeBanner({ me }: Props) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={7}>
        <Card
          sx={{
            borderRadius: 2,
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 60%)`,
            color: 'primary.contrastText',
            height: 1,
          }}
        >
          <CardContent sx={{ py: 3, '&:last-child': { pb: 3 } }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} spacing={2.5}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: 'primary.light',
                  fontSize: 22,
                  border: '2px solid rgba(255,255,255,0.3)',
                }}
              >
                {me ? getInitials(me.name) : 'U'}
              </Avatar>
              <Stack spacing={0.5}>
                <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  {greeting}, {me?.name ?? 'User'} 👋
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {me?.roles?.length
                    ? me.roles.map((r: MeRole) => r.roleName).join(', ')
                    : ''}
                  {me?.department ? ` · ${me.department}` : ''}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  Here&apos;s what&apos;s happening across your organization today.
                </Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={5}>
        <Card variant="outlined" sx={{ borderRadius: 2, height: 1, bgcolor: 'grey.50' }}>
          <CardContent sx={{ py: 3, '&:last-child': { pb: 3 } }}>
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ width: 32, height: 32, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'primary.lighter' }}>
                  <Iconify icon="solar:cloud-bold" width={16} color="primary.main" />
                </Box>
                <Stack>
                  <Typography variant="caption" color="text.secondary">Workspace</Typography>
                  <Typography variant="body2" fontWeight={600}>Production</Typography>
                </Stack>
              </Stack>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ width: 32, height: 32, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'success.lighter' }}>
                  <Iconify icon="solar:clock-circle-bold" width={16} color="success.main" />
                </Box>
                <Stack>
                  <Typography variant="caption" color="text.secondary">Today</Typography>
                  <Typography variant="body2" fontWeight={600}>{dayjs().format('dddd, MMMM D, YYYY')}</Typography>
                </Stack>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
