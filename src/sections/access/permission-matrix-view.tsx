import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { useRolePermissionsSummary } from 'src/services/hooks/use-permissions';

import { Iconify } from 'src/components/iconify';
import { PageHeader, PageContainer } from 'src/components/page-layout';

import PermissionMatrixStep2 from './permission-matrix-step2';

export default function PermissionMatrixViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: summary, isLoading } = useRolePermissionsSummary();

  const role = useMemo(() => {
    if (!summary || !id) return null;
    return summary.find((r: any) => r.id === Number(id)) ?? null;
  }, [summary, id]);

  const roleId = role?.id ?? Number(id);

  if (isLoading) {
    return (
      <>
        <Helmet><title>View Mapping - Permission Matrix - {CONFIG.appName}</title></Helmet>
        <PageContainer>
          <PageHeader title="Permission Matrix" description="View role-based permissions" />
          <Card sx={{ p: 4 }}>
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
          </Card>
        </PageContainer>
      </>
    );
  }

  if (!role) {
    return (
      <>
        <Helmet><title>View Mapping - Permission Matrix - {CONFIG.appName}</title></Helmet>
        <PageContainer>
          <PageHeader title="Permission Matrix" description="View role-based permissions" />
          <Card sx={{ p: 6, textAlign: 'center' }}>
            <Iconify icon="solar:user-id-bold" width={48} sx={{ color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">Role Not Found</Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mt: 1, mb: 3 }}>
              The role mapping you are looking for does not exist or has been removed.
            </Typography>
            <Button variant="contained" onClick={() => navigate(paths.dashboard.permissionMatrix)}>
              Back to Permission Matrix
            </Button>
          </Card>
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <Helmet><title>View Mapping - Permission Matrix - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader
          title="Permission Matrix"
          description="View role-based permissions"
        />

        <Card sx={{ overflow: 'hidden' }}>
          <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" spacing={6} flexWrap="wrap" useFlexGap>
              <Box>
                <Typography variant="caption" color="text.secondary">Department</Typography>
                <Typography variant="body2" fontWeight={600}>{role.departmentName ?? '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Hierarchy</Typography>
                <Typography variant="body2" fontWeight={600}>L{role.hierarchyLevelRank}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Role</Typography>
                <Typography variant="body2" fontWeight={600}>{role.name}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Modules</Typography>
                <Typography variant="body2" fontWeight={600}>{role.moduleCount}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Permissions</Typography>
                <Typography variant="body2" fontWeight={600}>{role.permissionCount}</Typography>
              </Box>
            </Stack>
          </Box>

          <PermissionMatrixStep2
            roleId={roleId}
            editable={false}
          />

          <Stack direction="row" justifyContent="flex-end" sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button color="inherit" startIcon={<Iconify icon="solar:alt-arrow-left-bold" />} onClick={() => navigate(paths.dashboard.permissionMatrix)}>
              Close
            </Button>
          </Stack>
        </Card>
      </PageContainer>
    </>
  );
}
