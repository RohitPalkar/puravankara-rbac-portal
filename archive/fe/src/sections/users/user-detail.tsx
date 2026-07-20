import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { mockUsers, mockRoles, mockModules, mockProjects, mockDepartments } from 'src/services/mock-data';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { PageHeader, PageContainer } from 'src/components/page-layout';

const TABS = ['Profile', 'Project Access', 'Permissions'];
const EMPLOYMENT_LABEL: Record<string, string> = {
  permanent: 'Permanent',
  contract: 'Contract',
  serving_notice_period: 'Serving Notice Period',
};

export default function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);

  const user = mockUsers.find((u) => u.id === id);
  const dept = mockDepartments.find((d) => d.id === user?.departmentId);

  const userModules = useMemo(() => {
    if (!user?.roleId) return [];
    const role = mockRoles.find((r) => r.id === user.roleId);
    if (!role) return [];
    return mockModules.filter((m) => !['1', '2', '3', '4', '5', '6', '7'].includes(m.id));
  }, [user?.roleId]);

  const projectDetails = useMemo(() => {
    if (!user) return [];
    return mockProjects.filter((p) => user.zoneIds.includes(p.zoneId));
  }, [user]);

  if (!user) {
    return (
      <PageContainer>
        <PageHeader title="User Not Found" />
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">User not found.</Typography>
          <Button onClick={() => navigate(paths.dashboard.userManagement)} sx={{ mt: 2 }}>Back to Users</Button>
        </Card>
      </PageContainer>
    );
  }

  return (
    <>
      <Helmet><title>{user.name} - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader
          title={user.name}
          description={`${user.employeeId} · ${user.roleName}`}
          action={
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={() => navigate(paths.dashboard.userManagement)} startIcon={<Iconify icon="solar:arrow-left-bold" width={16} />}>Back</Button>
              <Button variant="contained" startIcon={<Iconify icon="solar:pen-bold" width={16} />}>Edit</Button>
            </Stack>
          }
        />

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          {TABS.map((label) => <Tab key={label} label={label} />)}
        </Tabs>

        {tab === 0 && (
          <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3}>
            <Card sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>Identity</Typography>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between"><Typography variant="body2" color="text.secondary">Employee ID</Typography><Typography variant="body2" fontWeight={600}>{user.employeeId}</Typography></Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between"><Typography variant="body2" color="text.secondary">Name</Typography><Typography variant="body2" fontWeight={600}>{user.name}</Typography></Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between"><Typography variant="body2" color="text.secondary">Email</Typography><Typography variant="body2" fontWeight={600}>{user.email}</Typography></Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between"><Typography variant="body2" color="text.secondary">Mobile</Typography><Typography variant="body2" fontWeight={600}>{user.phone}</Typography></Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between"><Typography variant="body2" color="text.secondary">Status</Typography><Label color={user.status === 'active' ? 'success' : 'default'}>{user.status}</Label></Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between"><Typography variant="body2" color="text.secondary">Employment Status</Typography><Typography variant="body2" fontWeight={600}>{EMPLOYMENT_LABEL[user.employmentStatus ?? ''] ?? user.employmentStatus ?? '-'}</Typography></Stack>
              </Stack>
            </Card>
            <Card sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>Organization</Typography>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between"><Typography variant="body2" color="text.secondary">Department</Typography><Typography variant="body2" fontWeight={600}>{dept?.name ?? user.departmentName}</Typography></Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between"><Typography variant="body2" color="text.secondary">Hierarchy Level</Typography><Typography variant="body2" fontWeight={600}>{user.level}</Typography></Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between"><Typography variant="body2" color="text.secondary">User Group</Typography><Typography variant="body2" fontWeight={600}>{user.userGroup ?? '-'}</Typography></Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between"><Typography variant="body2" color="text.secondary">Start Date</Typography><Typography variant="body2" fontWeight={600}>{user.startDate ?? '-'}</Typography></Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between"><Typography variant="body2" color="text.secondary">End Date</Typography><Typography variant="body2" fontWeight={600}>{user.endDate || user.employmentStatus === 'permanent' ? 'N/A (Permanent)' : '-'}</Typography></Stack>
              </Stack>
            </Card>
            <Card sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>Roles</Typography>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between"><Typography variant="body2" color="text.secondary">Primary Role</Typography><Typography variant="body2" fontWeight={600}>{user.roleName}</Typography></Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between"><Typography variant="body2" color="text.secondary">Secondary Role</Typography><Typography variant="body2" fontWeight={600}>{user.secondaryRoleName ?? '-'}</Typography></Stack>
              </Stack>
            </Card>
            <Card sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>Hierarchy</Typography>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between"><Typography variant="body2" color="text.secondary">Reporting Manager</Typography><Typography variant="body2" fontWeight={600}>{user.reportingManagerName ?? '-'}</Typography></Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between"><Typography variant="body2" color="text.secondary">Zone Access</Typography><Typography variant="body2" fontWeight={600}>{user.zoneNames?.join(', ') ?? '-'}</Typography></Stack>
              </Stack>
            </Card>
          </Box>
        )}

        {tab === 1 && (
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Project Access (Module → Project)</Typography>
            {userModules.length === 0 ? (
              <Typography variant="body2" color="text.disabled">No access modules defined for this user role.</Typography>
            ) : (
              <Stack spacing={2}>
                {userModules.map((mod) => {
                  const modProjects = projectDetails.filter((p) => user.zoneIds.includes(p.zoneId));
                  if (modProjects.length === 0) return null;
                  return (
                    <Box key={mod.id}>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                        <Iconify icon={mod.icon} width={18} color="primary.main" />
                        <Typography variant="subtitle2">{mod.name}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ ml: 4 }}>
                        {modProjects.map((p) => (
                          <Chip key={p.id} label={p.name} size="small" color="primary" variant="outlined" />
                        ))}
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Card>
        )}

        {tab === 2 && (
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Permissions Snapshot</Typography>
            {userModules.length === 0 ? (
              <Typography variant="body2" color="text.disabled">No permissions configured for this role.</Typography>
            ) : (
              <Stack spacing={2}>
                {userModules.map((mod) => (
                  <Box key={mod.id}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                      <Iconify icon={mod.icon} width={18} color="primary.main" />
                      <Typography variant="subtitle2">{mod.name}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ ml: 4 }}>
                      {['View', 'Create', 'Edit', 'Delete', 'Approve', 'Reject', 'Export'].map((action) => (
                        <Chip
                          key={action}
                          label={action}
                          size="small"
                          variant="outlined"
                          color={['View', 'Create'].includes(action) ? 'primary' : 'default'}
                          icon={['View', 'Create'].includes(action) ? <Iconify icon="solar:check-circle-bold" width={12} /> : undefined}
                        />
                      ))}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </Card>
        )}
      </PageContainer>
    </>
  );
}