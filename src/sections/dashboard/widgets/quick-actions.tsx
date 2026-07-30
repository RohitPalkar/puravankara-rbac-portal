import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { Iconify } from 'src/components/iconify';

const ACTIONS = [
  { label: 'Create User', icon: 'solar:add-user-bold', path: paths.dashboard.userNew, color: '#2F3C98', desc: 'Add a new employee to the system' },
  { label: 'Create Department', icon: 'solar:buildings-bold', path: paths.dashboard.departmentMasterCreate, color: '#00BCD4', desc: 'Set up a new department' },
  { label: 'Assign Permissions', icon: 'solar:lock-bold', path: paths.dashboard.permissionMatrix, color: '#9C27B0', desc: 'Configure role-based access' },
  { label: 'Create Project', icon: 'solar:folder-bold', path: paths.dashboard.projectMasterCreate, color: '#FF9800', desc: 'Add a new construction project' },
  { label: 'Audit Logs', icon: 'solar:clipboard-list-bold', path: paths.dashboard.auditLogs, color: '#E91E63', desc: 'Review system activity' },
  { label: 'Zone Master', icon: 'solar:map-point-wave-bold', path: paths.dashboard.zoneMaster, color: '#4CAF50', desc: 'Manage geographic zones' },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <Grid container spacing={2}>
      {ACTIONS.map((action) => (
        <Grid item xs={6} md={4} key={action.label}>
          <Paper
            variant="outlined"
            sx={{
              borderRadius: 2,
              p: 2,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: action.color,
                bgcolor: `${action.color}08`,
                transform: 'translateY(-2px)',
                boxShadow: `0 4px 12px ${action.color}20`,
              },
            }}
            onClick={() => navigate(action.path)}
          >
            <Stack spacing={1.5} alignItems="center" textAlign="center">
              <Box sx={{ width: 40, height: 40, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: `${action.color}14` }}>
                <Iconify icon={action.icon} width={20} sx={{ color: action.color }} />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                  {action.label}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: 'block' }}>
                  {action.desc}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
