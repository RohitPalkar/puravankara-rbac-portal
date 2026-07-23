import { Helmet } from 'react-helmet-async';

import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { CONFIG } from 'src/config-global';

import { PageHeader, PageContainer } from 'src/components/page-layout';

import { useAuthContext } from 'src/auth/hooks';

export default function SettingsPage() {
  const { user } = useAuthContext();

  return (
    <>
      <Helmet><title>Settings - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader title="Settings" description="Account and system information" />
        <Card sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="subtitle1">Account</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" color="text.secondary">User:</Typography>
              <Typography variant="body2">{user?.name || user?.empId || '-'}</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" color="text.secondary">Email:</Typography>
              <Typography variant="body2">{user?.email || '-'}</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" color="text.secondary">Role:</Typography>
              <Chip label={user?.role || 'N/A'} size="small" color="primary" variant="soft" />
            </Stack>
          </Stack>
        </Card>
      </PageContainer>
    </>
  );
}
