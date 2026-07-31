import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { useMyPermissions } from 'src/services/hooks/use-permissions';
import { useModuleTree } from 'src/services/hooks/use-product-catalog';

import { Iconify } from 'src/components/iconify';
import { PageHeader, PageContainer } from 'src/components/page-layout';

import { useModuleActions } from './hooks/use-module-permission';
import { moduleDescription, submoduleDescription } from './module-descriptions';

function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function SectionHeader({ icon, label }: { icon: string; label: string }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2, mt: 3 }}>
      <Box sx={{ width: 30, height: 30, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'primary.lighter' }}>
        <Iconify icon={icon} width={16} sx={{ color: 'primary.main' }} />
      </Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: 'text.primary' }}>
        {label}
      </Typography>
      <Box sx={{ flex: 1, height: 1, bgcolor: 'divider' }} />
    </Stack>
  );
}

export default function ModuleDashboardPage() {
  const navigate = useNavigate();
  const { moduleCode = '' } = useParams<{ moduleCode: string }>();
  const { subModules, moduleName, isLoading } = useModuleActions();
  const { data: myPermissions } = useMyPermissions();
  const { data: moduleTree } = useModuleTree();

  const treeModule = (moduleTree ?? []).find((m) => slugify(m.name) === moduleCode);

  const assignedProjects = (myPermissions?.projects ?? [])
    .filter((p) => p.id !== 0 && (p.modules ?? []).some((m) => treeModule && m.id === treeModule.id));

  if (isLoading) {
    return (
      <PageContainer>
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Card>
                <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 1 }} />
              </Card>
            </Grid>
          ))}
        </Grid>
      </PageContainer>
    );
  }

  return (
    <>
      <Helmet><title>{moduleName || 'Module'} - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader
          title={moduleName || 'Module'}
          description={moduleDescription(moduleName, treeModule?.code)}
        />

        {subModules.length === 0 ? (
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography color="text.secondary">
                You don&apos;t have access to this module. Contact your administrator if you believe this is incorrect.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <>
            <SectionHeader icon="solar:folder-with-files-bold" label="Assigned Projects" />
            <Grid container spacing={2}>
              {assignedProjects.length === 0 ? (
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        All projects (Super Admin access).
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ) : (
                assignedProjects.map((project) => (
                  <Grid item xs={12} sm={6} md={4} key={project.id}>
                    <Card variant="outlined" sx={{ borderRadius: 2, height: 1 }}>
                      <CardContent>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box sx={{ width: 36, height: 36, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'primary.lighter' }}>
                            <Iconify icon="solar:building-bold" width={18} color="primary.main" />
                          </Box>
                          <Typography variant="body2" fontWeight={700}>{project.name}</Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>

            <SectionHeader icon="solar:widget-5-bold" label="Available Submodules" />
            <Grid container spacing={2}>
              {subModules.map((sm) => {
                const allowedActions = sm.actions.filter((a) => a.allowed).map((a) => a.code);
                return (
                  <Grid item xs={12} sm={6} md={4} key={sm.id}>
                    <Card variant="outlined" sx={{ borderRadius: 2, height: 1, display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                          <Box sx={{ width: 40, height: 40, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'primary.lighter' }}>
                            <Iconify icon="solar:box-minimalistic-bold" width={20} color="primary.main" />
                          </Box>
                          <Typography variant="subtitle1" fontWeight={700}>{sm.name}</Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {submoduleDescription(sm.name)}
                        </Typography>
                        <Stack direction="row" flexWrap="wrap" spacing={0.5}>
                          {allowedActions.slice(0, 4).map((code) => (
                            <Chip key={code} size="small" label={code} color="success" variant="outlined" />
                          ))}
                          {allowedActions.length > 4 && (
                            <Chip size="small" label={`+${allowedActions.length - 4}`} color="default" variant="outlined" />
                          )}
                        </Stack>
                      </CardContent>
                      <Box sx={{ p: 2, pt: 0 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          size="small"
                          startIcon={<Iconify icon="solar:arrow-right-up-bold" />}
                          onClick={() => navigate(paths.dashboard.modules.submodule(moduleCode, sm.id ?? ''))}
                        >
                          Open
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </>
        )}
      </PageContainer>
    </>
  );
}
