import type { Role } from 'src/services/types/organization';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Radio from '@mui/material/Radio';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import RadioGroup from '@mui/material/RadioGroup';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormHelperText from '@mui/material/FormHelperText';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useRoleList, useRemoveRoleDependencies } from 'src/services/hooks/use-organization';

import { Iconify } from 'src/components/iconify';

interface Props {
  open: boolean;
  roleId: number | null;
  roleName: string;
  onClose: () => void;
  onConfirm: (payload: { mode: 'MERGE' | 'REPLACE'; destinationRoleId: number }) => void;
  loading?: boolean;
}

export function RemoveRoleDialog({ open, roleId, roleName, onClose, onConfirm, loading }: Props) {
  const [mode, setMode] = useState<'MERGE' | 'REPLACE'>('MERGE');
  const [destinationRole, setDestinationRole] = useState<Role | null>(null);

  const { data: rolesData } = useRoleList({ page: 1, limit: 100, sortBy: 'name', sortOrder: 'ASC' } as any);
  const { data: deps } = useRemoveRoleDependencies(roleId);

  const roles = (rolesData ?? []).filter((r: Role) => r.id !== roleId && r.isActive !== false);

  useEffect(() => {
    if (open) {
      setMode('MERGE');
      setDestinationRole(null);
    }
  }, [open]);

  const handleConfirm = () => {
    if (!destinationRole) return;
    onConfirm({ mode, destinationRoleId: destinationRole.id });
  };

  const depsList = [
    { label: 'Users to be migrated', value: deps?.users ?? 0, icon: 'solar:users-group-rounded-bold' },
    { label: 'Permission Groups', value: deps?.permissions ?? 0, icon: 'solar:shield-check-bold' },
    { label: 'Project Permissions', value: deps?.projectPermissions ?? 0, icon: 'solar:folder-check-bold' },
    { label: 'Approval Workflows', value: deps?.approvalSteps ?? 0, icon: 'solar:checklist-bold' },
    { label: 'Department Mappings', value: deps?.departmentMappings ?? 0, icon: 'solar:building-3-bold' },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Iconify icon="solar:trash-bin-trash-bold" sx={{ color: 'error.main' }} />
        Remove Role
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Alert severity="warning" icon={<Iconify icon="solar:danger-triangle-bold" />}>
            <Typography variant="body2" fontWeight={600}>
              &quot;{roleName}&quot;
            </Typography>
            <Typography variant="body2">
              This role is currently being used across the organisation. Choose how you want to proceed.
            </Typography>
          </Alert>

          <RadioGroup value={mode} onChange={(e) => setMode(e.target.value as 'MERGE' | 'REPLACE')}>
            <Card
              sx={{
                p: 2,
                mb: 1.5,
                border: '1px solid',
                borderColor: mode === 'MERGE' ? 'primary.main' : 'divider',
                bgcolor: mode === 'MERGE' ? 'action.selected' : 'background.paper',
              }}
            >
              <FormControlLabel
                value="MERGE"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="subtitle2">Merge Role</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Combine permissions and users into another role. Nothing is lost.
                    </Typography>
                  </Box>
                }
                sx={{ alignItems: 'flex-start', mx: 0 }}
              />
            </Card>

            <Card
              sx={{
                p: 2,
                mb: 1.5,
                border: '1px solid',
                borderColor: mode === 'REPLACE' ? 'primary.main' : 'divider',
                bgcolor: mode === 'REPLACE' ? 'action.selected' : 'background.paper',
              }}
            >
              <FormControlLabel
                value="REPLACE"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="subtitle2">Replace Role</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Reassign users to another role. Source role permissions are discarded.
                    </Typography>
                  </Box>
                }
                sx={{ alignItems: 'flex-start', mx: 0 }}
              />
            </Card>
          </RadioGroup>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {mode === 'MERGE' ? 'Merge into' : 'Replace with'}
            </Typography>
            <Autocomplete
              value={destinationRole}
              onChange={(_, newValue) => setDestinationRole(newValue)}
              options={roles}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={`Select ${mode === 'MERGE' ? 'destination' : 'replacement'} role...`}
                  size="small"
                />
              )}
              noOptionsText="No other roles available"
            />
            {mode === 'MERGE' && destinationRole && (
              <FormHelperText>
                Resulting role permissions will be the union of both roles.
              </FormHelperText>
            )}
            {mode === 'REPLACE' && destinationRole && (
              <FormHelperText>
                Users will inherit only the destination role&apos;s existing permissions.
              </FormHelperText>
            )}
          </Box>

          {deps && deps.total > 0 && (
            <Box>
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Dependencies to be migrated
              </Typography>
              <Stack spacing={0.5}>
                {depsList.map((dep) =>
                  dep.value > 0 ? (
                    <Stack key={dep.label} direction="row" alignItems="center" spacing={1}>
                      <Iconify icon={dep.icon} width={16} sx={{ color: 'text.secondary', flexShrink: 0 }} />
                      <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                        {dep.label}
                      </Typography>
                      <Typography variant="caption" fontWeight={600}>
                        {dep.value}
                      </Typography>
                    </Stack>
                  ) : null
                )}
              </Stack>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Cancel
        </Button>
        <Tooltip title={!destinationRole ? 'Select a destination role first' : ''}>
          <span>
            <Button
              onClick={handleConfirm}
              variant="contained"
              color="error"
              disabled={!destinationRole || loading}
            >
              {loading ? 'Processing...' : mode === 'MERGE' ? 'Merge Role' : 'Replace Role'}
            </Button>
          </span>
        </Tooltip>
      </DialogActions>
    </Dialog>
  );
}
