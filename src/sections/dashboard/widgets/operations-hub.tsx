
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { Iconify } from 'src/components/iconify';

export function OperationsHub() {
  const opsCards = [
    {
      icon: 'solar:clock-circle-bold',
      label: 'Pending User Approvals',
      value: 0,
      color: '#FF9800',
      action: 'View Queue →',
      bgColor: '#FFF3E0',
    },
    {
      icon: 'solar:lock-bold',
      label: 'Permission Requests',
      value: 0,
      color: '#E91E63',
      action: 'Review →',
      bgColor: '#FCE4EC',
    },
    {
      icon: 'solar:user-id-bold',
      label: 'Users Without Roles',
      value: 0,
      color: '#F44336',
      action: 'Assign →',
      bgColor: '#FFEBEE',
    },
    {
      icon: 'solar:users-group-rounded-bold',
      label: 'Inactive Users',
      value: 0,
      color: '#9C27B0',
      action: 'View →',
      bgColor: '#F3E5F5',
    },
  ];

  const showAny = opsCards.some((c) => c.value > 0);

  if (!showAny) {
    return (
      <Card variant="outlined" sx={{ borderRadius: 1.5 }}>
        <CardContent>
          <Stack spacing={1} alignItems="center" sx={{ py: 0.5 }}>
            <Iconify icon="solar:check-circle-bold" width={28} color="success.main" />
            <Typography variant="body2" color="text.secondary">No pending items requiring attention.</Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Grid container spacing={2}>
      {opsCards.map((card) => (
        <Grid item xs={6} md={3} key={card.label}>
          <Card variant="outlined" sx={{ borderRadius: 1.5, bgcolor: card.bgColor, height: 1 }}>
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
              <Stack spacing={1.5}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Iconify icon={card.icon} width={24} sx={{ color: card.color }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: card.color }}>
                    {card.value}
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                  {card.label}
                </Typography>
                <Button size="small" variant="text" sx={{ color: card.color, p: 0, minWidth: 0, justifyContent: 'flex-start', '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}>
                  {card.action}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
