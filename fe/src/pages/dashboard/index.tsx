import { Helmet } from 'react-helmet-async';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { usePermission } from 'src/hooks/use-permission';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';
import { PageHeader, PageContainer } from 'src/components/page-layout';

export default function DashboardPage() {
  const { activeUser, activeRole, availableRoles, getAllowedModules } = usePermission();
  const allowedModules = getAllowedModules();

  return (
    <>
      <Helmet><title>Dashboard - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader title="Dashboard" description="Overview of your current access and permissions" />

        <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr 1fr' }} gap={3} sx={{ mb: 3 }}>
          <Card sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
              <Iconify icon="solar:user-id-bold-duotone" width={28} color="primary.main" />
              <Typography variant="subtitle1">User</Typography>
            </Stack>
            <Typography variant="h6">{activeUser?.name ?? 'Unknown'}</Typography>
            <Typography variant="body2" color="text.secondary">{activeUser?.email ?? '-'}</Typography>
          </Card>

          <Card sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
              <Iconify icon="solar:user-speak-rounded-bold-duotone" width={28} color="primary.main" />
              <Typography variant="subtitle1">Current Role</Typography>
            </Stack>
            <Typography variant="h6">{activeRole?.roleName ?? 'None'}</Typography>
            <Typography variant="body2" color="text.secondary">
              {availableRoles.length > 1 ? `${availableRoles.length} roles available — use the switcher in header` : 'Single role'}
            </Typography>
          </Card>

          <Card sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
              <Iconify icon="solar:shield-check-bold-duotone" width={28} color="primary.main" />
              <Typography variant="subtitle1">Module Access</Typography>
            </Stack>
            <Typography variant="h6">{allowedModules.length}</Typography>
            <Typography variant="body2" color="text.secondary">modules available</Typography>
          </Card>
        </Box>

        <Card sx={{ p: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>Your Access — Allowed Modules</Typography>
          {allowedModules.length === 0 ? (
            <Typography variant="body2" color="text.disabled">No modules assigned.</Typography>
          ) : (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {allowedModules.map((mod) => (
                <Chip
                  key={mod.code}
                  label={mod.name}
                  size="small"
                  color="primary"
                  variant="soft"
                  icon={<Iconify icon="solar:check-circle-bold" width={14} />}
                />
              ))}
            </Stack>
          )}
        </Card>
      </PageContainer>
    </>
  );
}