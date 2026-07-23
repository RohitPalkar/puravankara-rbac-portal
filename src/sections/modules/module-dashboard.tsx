import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';
import { PageHeader, PageContainer } from 'src/components/page-layout';

import { useModuleActions } from './hooks/use-module-permission';

export default function ModuleDashboardPage() {
  const navigate = useNavigate();
  const { actions, subModules, moduleName, isLoading } = useModuleActions();

  if (isLoading) {
    return (
      <PageContainer>
        <CircularProgress />
      </PageContainer>
    );
  }

  return (
    <>
      <Helmet><title>{moduleName || 'Module'} Dashboard - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader
          title={`${moduleName || 'Module'} Dashboard`}
          description={`Overview of ${moduleName || 'the module'} and your access permissions.`}
          action={
            actions.VIEW && (
              <Button
                variant="contained"
                startIcon={<Iconify icon="solar:list-bold" />}
                onClick={() => navigate(`/dashboard/modules/${window.location.pathname.split('/')[3]}/list`)}
              >
                View Records
              </Button>
            )
          }
        />

        <Grid container spacing={3}>
          {['VIEW', 'CREATE', 'EDIT', 'DELETE', 'APPROVE', 'EXPORT'].map((action) => (
            <Grid item xs={12} sm={6} md={4} key={action}>
              <Card>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1">{action}</Typography>
                    <Chip
                      label={actions[action] ? 'Allowed' : 'Denied'}
                      color={actions[action] ? 'success' : 'error'}
                      size="small"
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Card sx={{ mt: 3 }}>
          <CardHeader title="Submodules & Permissions" />
          <CardContent>
            {subModules.length === 0 ? (
              <Typography color="text.secondary">No submodules available for this module.</Typography>
            ) : (
              <Grid container spacing={2}>
                {subModules.map((sm) => (
                  <Grid item xs={12} sm={6} md={4} key={sm.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom>{sm.name}</Typography>
                        <Stack direction="row" flexWrap="wrap" spacing={0.5}>
                          {sm.actions.map((a) => (
                            <Chip
                              key={a.code}
                              label={a.label || a.code}
                              color={a.allowed ? 'success' : 'default'}
                              size="small"
                              variant={a.allowed ? 'filled' : 'outlined'}
                            />
                          ))}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </Card>
      </PageContainer>
    </>
  );
}
