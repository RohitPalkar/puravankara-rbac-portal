import { Helmet } from 'react-helmet-async';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CONFIG } from 'src/config-global';
import { PageContainer, PageHeader } from 'src/components/page-layout';

export default function SettingsPage() {
  return (
    <>
      <Helmet><title>Settings - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader title="Settings" description="Application settings" />
        <Card sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="body1" color="text.secondary">
              Settings configuration coming soon.
            </Typography>
          </Stack>
        </Card>
      </PageContainer>
    </>
  );
}
