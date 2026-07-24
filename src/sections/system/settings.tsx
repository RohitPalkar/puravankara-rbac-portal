import { useState } from 'react';
import { Helmet } from 'react-helmet-async';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';
import { PageHeader, PageContainer } from 'src/components/page-layout';

export default function SettingsPage() {

  const [darkMode, setDarkMode] = useState(false);
  const [compactView, setCompactView] = useState(false);

  return (
    <>
      <Helmet><title>Settings - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader title="Settings" description="Manage application preferences and configuration" />

        <Card sx={{ p: 3, mb: 3 }}>
          <Stack spacing={2.5}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Iconify icon="solar:settings-bold" width={20} color="primary.main" />
              <Typography variant="subtitle1" fontWeight={600}>General</Typography>
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" fontWeight={500}>Language</Typography>
                <Typography variant="caption" color="text.secondary">English (United States)</Typography>
              </Box>
              <Chip label="English" size="small" color="primary" variant="outlined" />
            </Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" fontWeight={500}>Timezone</Typography>
                <Typography variant="caption" color="text.secondary">(UTC +05:30) Asia/Kolkata</Typography>
              </Box>
              <Chip label="IST" size="small" variant="outlined" />
            </Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" fontWeight={500}>Date Format</Typography>
                <Typography variant="caption" color="text.secondary">DD-MM-YYYY</Typography>
              </Box>
              <Chip label="DD-MM-YYYY" size="small" variant="outlined" />
            </Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" fontWeight={500}>Number Format</Typography>
                <Typography variant="caption" color="text.secondary">1,234.56 (Indian)</Typography>
              </Box>
              <Chip label="Indian" size="small" variant="outlined" />
            </Stack>
          </Stack>
        </Card>

        <Card sx={{ p: 3, mb: 3 }}>
          <Stack spacing={2.5}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Iconify icon="solar:palette-round-bold" width={20} color="primary.main" />
              <Typography variant="subtitle1" fontWeight={600}>Appearance</Typography>
            </Stack>
            <Divider />
            <FormControlLabel
              control={<Switch checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} />}
              label={
                <Box>
                  <Typography variant="body2" fontWeight={500}>Dark Mode</Typography>
                  <Typography variant="caption" color="text.secondary">Toggle dark theme across the application</Typography>
                </Box>
              }
              sx={{ alignItems: 'center', gap: 1, mx: 0 }}
            />
            <FormControlLabel
              control={<Switch checked={compactView} onChange={(e) => setCompactView(e.target.checked)} />}
              label={
                <Box>
                  <Typography variant="body2" fontWeight={500}>Compact View</Typography>
                  <Typography variant="caption" color="text.secondary">Reduce spacing for a denser layout</Typography>
                </Box>
              }
              sx={{ alignItems: 'center', gap: 1, mx: 0 }}
            />
          </Stack>
        </Card>

        <Card sx={{ p: 3, mb: 3 }}>
          <Stack spacing={2.5}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Iconify icon="solar:shield-bold" width={20} color="primary.main" />
              <Typography variant="subtitle1" fontWeight={600}>Security</Typography>
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" fontWeight={500}>Password</Typography>
                <Typography variant="caption" color="text.secondary">Last changed 30 days ago</Typography>
              </Box>
              <Chip label="Change" size="small" color="primary" variant="outlined" />
            </Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" fontWeight={500}>Two-Factor Authentication</Typography>
                <Typography variant="caption" color="text.secondary">Add an extra layer of security</Typography>
              </Box>
              <Chip label="Disabled" size="small" variant="outlined" />
            </Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" fontWeight={500}>Session Timeout</Typography>
                <Typography variant="caption" color="text.secondary">Auto-logout after 30 minutes of inactivity</Typography>
              </Box>
              <Chip label="30 min" size="small" variant="outlined" />
            </Stack>
          </Stack>
        </Card>

        <Card sx={{ p: 3, mb: 3 }}>
          <Stack spacing={2.5}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Iconify icon="solar:login-2-bold" width={20} color="primary.main" />
              <Typography variant="subtitle1" fontWeight={600}>Session Management</Typography>
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" fontWeight={500}>Active Sessions</Typography>
                <Typography variant="caption" color="text.secondery">1 active session</Typography>
              </Box>
              <Chip label="1 Session" size="small" color="success" variant="outlined" />
            </Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" fontWeight={500}>Last Login</Typography>
                <Typography variant="caption" color="text.secondary">Today, 09:30 AM</Typography>
              </Box>
              <Chip label="Active Now" size="small" color="success" variant="filled" />
            </Stack>
          </Stack>
        </Card>

        <Card sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Iconify icon="solar:info-circle-bold" width={20} color="primary.main" />
              <Typography variant="subtitle1" fontWeight={600}>About Application</Typography>
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" fontWeight={500}>Application Name</Typography>
              <Typography variant="body2">{CONFIG.appName}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" fontWeight={500}>Version</Typography>
              <Chip label="1.0.0" size="small" variant="outlined" />
            </Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" fontWeight={500}>Environment</Typography>
              <Chip label={import.meta.env.MODE === 'development' ? 'Development' : 'Production'} size="small" color="info" variant="outlined" />
            </Stack>
          </Stack>
        </Card>
      </PageContainer>
    </>
  );
}
