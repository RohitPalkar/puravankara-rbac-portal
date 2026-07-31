import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { CONFIG } from 'src/config-global';
import { useMe } from 'src/services/hooks/use-auth';
import { useMyPermissions } from 'src/services/hooks/use-permissions';
import { useModuleTree } from 'src/services/hooks/use-product-catalog';

import { Iconify } from 'src/components/iconify';
import { PageContainer } from 'src/components/page-layout';

import { ModuleShortcuts } from './module-shortcuts';
import { AssignedProjects } from './assigned-projects';
import { PermissionSummary } from './permission-summary';
import { WelcomeBanner } from '../widgets/welcome-banner';

function SectionHeader({ icon, label }: { icon: string; label: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
      <Box sx={{ width: 30, height: 30, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'primary.lighter' }}>
        <Iconify icon={icon} width={16} sx={{ color: 'primary.main' }} />
      </Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>
        {label}
      </Typography>
      <Box sx={{ flex: 1, height: 1, bgcolor: 'divider' }} />
    </Box>
  );
}

export default function BusinessDashboard() {
  const { data: me } = useMe();
  const { data: myPermissions, isLoading: permissionsLoading } = useMyPermissions();
  const { data: moduleTree, isLoading: treeLoading } = useModuleTree();

  const assignedProjectIds = useMemo(
    () => (myPermissions?.projects ?? []).map((p) => Number(p.id)),
    [myPermissions]
  );

  return (
    <>
      <Helmet><title>Dashboard - {CONFIG.appName}</title></Helmet>
      <PageContainer maxWidth="xl">
        <Box sx={{ mb: 3 }}>
          <WelcomeBanner me={me} />
        </Box>

        <Box sx={{ mb: 3 }}>
          <SectionHeader icon="solar:building-bold" label="Assigned Projects" />
          <AssignedProjects projectIds={assignedProjectIds} />
        </Box>

        <Box sx={{ mb: 3 }}>
          <SectionHeader icon="solar:folder-bold" label="My Modules" />
          <ModuleShortcuts permissions={myPermissions} moduleTree={moduleTree} isLoading={permissionsLoading || treeLoading} />
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <PermissionSummary permissions={myPermissions} moduleTree={moduleTree} isLoading={permissionsLoading || treeLoading} />
          </Grid>
        </Grid>
      </PageContainer>
    </>
  );
}
