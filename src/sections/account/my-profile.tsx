import { Helmet } from 'react-helmet-async';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

import { CONFIG } from 'src/config-global';
import { useMe } from 'src/services/hooks/use-auth';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { PageHeader, PageContainer } from 'src/components/page-layout';

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1 }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2" fontWeight={600}>{value ?? '—'}</Typography>
    </Stack>
  );
}

export default function MyProfilePage() {
  const { data: me, isLoading } = useMe();

  return (
    <>
      <Helmet><title>My Profile - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader title="My Profile" description="View your account details and assigned roles" />

        <Card sx={{ p: 3, maxWidth: 720 }}>
          {isLoading ? (
            <Stack spacing={2}>
              <Skeleton variant="circular" width={72} height={72} />
              <Skeleton width={200} height={24} />
              <Skeleton width={280} height={20} />
            </Stack>
          ) : (
            <>
              <Stack direction="row" spacing={2.5} alignItems="center" sx={{ mb: 2 }}>
                <Avatar sx={{ width: 72, height: 72, fontSize: 28, bgcolor: 'primary.main' }}>
                  {me?.name?.charAt(0).toUpperCase()}
                </Avatar>
                <Stack>
                  <Typography variant="h6">{me?.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{me?.email}</Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Label color="primary" variant="soft">EMP ID: {me?.empId}</Label>
                    {me?.employmentStatus && <Label color="success" variant="soft">{me.employmentStatus}</Label>}
                  </Stack>
                </Stack>
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Stack>
                <InfoRow label="Employee ID" value={me?.empId} />
                <InfoRow label="Full Name" value={me?.name} />
                <InfoRow label="Email" value={me?.email} />
                <InfoRow label="Department" value={me?.department} />
                <InfoRow label="Employment Status" value={me?.employmentStatus} />
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                  <Iconify icon="solar:user-id-bold" width={18} color="primary.main" />
                  <Typography variant="subtitle2">Assigned Roles</Typography>
                </Stack>
                {me?.roles?.length ? (
                  me.roles.map((role) => (
                    <Card key={role.roleId} variant="outlined" sx={{ borderRadius: 1.5, px: 2, py: 1.25 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{role.roleName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {role.departmentName}{role.isSystemRole ? ' · System Role' : ''}
                          </Typography>
                        </Box>
                        <Label color="info" variant="soft">L{role.hierarchyLevelRank}</Label>
                      </Stack>
                    </Card>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">No roles assigned.</Typography>
                )}
              </Stack>
            </>
          )}
        </Card>
      </PageContainer>
    </>
  );
}
