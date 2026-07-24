import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { paths } from 'src/routes/paths';

import { Iconify } from 'src/components/iconify';

interface Props {
  isSuperAdmin: boolean;
  hasUserAccess: boolean;
}

const ALL_ACTIONS = [
  { label: 'Create User', icon: 'solar:add-user-bold', path: paths.dashboard.userNew, permission: 'user' },
  { label: 'Create Department', icon: 'solar:buildings-bold', path: paths.dashboard.departmentMasterCreate, permission: 'dept' },
  { label: 'Create Project', icon: 'solar:folder-bold', path: paths.dashboard.projectMasterCreate, permission: 'project' },
  { label: 'Configure Permissions', icon: 'solar:lock-bold', path: paths.dashboard.permissionMatrix, permission: 'perm' },
  { label: 'Create Brand', icon: 'solar:tag-bold', path: paths.dashboard.brandMasterCreate, permission: 'brand' },
  { label: 'View Audit Logs', icon: 'solar:clipboard-list-bold', path: paths.dashboard.auditLogs, permission: 'audit' },
];

export function QuickActions({ isSuperAdmin, hasUserAccess }: Props) {
  const navigate = useNavigate();

  const visible = useMemo(() => {
    if (isSuperAdmin) return ALL_ACTIONS;
    return ALL_ACTIONS.filter((a) => {
      if (a.permission === 'user' && !hasUserAccess) return false;
      return true;
    });
  }, [isSuperAdmin, hasUserAccess]);

  return (
    <Card variant="outlined" sx={{ borderRadius: 1.5, height: 1 }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
          <Box sx={{ width: 28, height: 28, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'warning.lighter' }}>
            <Iconify icon="solar:flash-bold" width={16} color="warning.main" />
          </Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Quick Actions</Typography>
        </Stack>
        <Stack spacing={1}>
          {visible.map((action) => (
            <Button
              key={action.label}
              variant="outlined"
              fullWidth
              startIcon={<Iconify icon={action.icon} width={16} />}
              onClick={() => navigate(action.path)}
              sx={{
                justifyContent: 'flex-start',
                borderRadius: 1.5,
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.8125rem',
                color: 'text.primary',
                borderColor: 'divider',
                '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.lighter' },
              }}
            >
              {action.label}
            </Button>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
