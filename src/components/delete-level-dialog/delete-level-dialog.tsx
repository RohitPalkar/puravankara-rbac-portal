import type { HierarchyLevel } from 'src/services/types/organization';

import { useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { Iconify } from 'src/components/iconify';

interface Props {
  open: boolean;
  levelNumber: number | null;
  levelName: string;
  hierarchyLevels: HierarchyLevel[];
  onClose: () => void;
  onConfirm: (destinationLevelNumber: number) => void;
  loading?: boolean;
}

export function MergeLevelDialog({ open, levelNumber, levelName, hierarchyLevels, onClose, onConfirm, loading }: Props) {
  const [destination, setDestination] = useState<HierarchyLevel | null>(null);

  const candidates = useMemo(
    () => (hierarchyLevels ?? []).filter((hl) => hl.levelNumber !== levelNumber),
    [hierarchyLevels, levelNumber],
  );

  useEffect(() => {
    if (open) setDestination(null);
  }, [open]);

  const handleConfirm = () => {
    if (!destination) return;
    onConfirm(destination.levelNumber);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'warning.lighter',
          }}
        >
          <Iconify icon="solar:git-compare-bold" width={18} sx={{ color: 'warning.main' }} />
        </Box>
        Merge Level
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Select the destination level that will receive all assignments from the level being removed.
          </Typography>

          <Box>
            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Level to Merge
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={`Level ${levelNumber} – ${levelName || 'Enter Role Name'}`}
              inputProps={{ readOnly: true }}
              sx={{ '& .MuiInputBase-root': { bgcolor: 'action.hover' } }}
            />
          </Box>

          <Box>
            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Merge Into
            </Typography>
            <Autocomplete
              options={candidates}
              value={destination}
              onChange={(_, v) => setDestination(v)}
              getOptionLabel={(o) => `Level ${o.levelNumber} – ${o.roleName || 'Enter Role Name'}`}
              isOptionEqualToValue={(o, v) => o.levelNumber === v.levelNumber}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search destination level..."
                  size="small"
                />
              )}
              noOptionsText="No other levels available"
              fullWidth
            />
          </Box>

          <Divider />

          <Box>
            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
              What happens next?
            </Typography>
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Iconify icon="solar:users-group-rounded-bold" width={18} sx={{ color: 'info.main', mt: 0.25, flexShrink: 0 }} />
                <Typography variant="body2" color="text.secondary">
                  <strong>Users</strong> — All users assigned to this level will automatically move to the selected level.
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Iconify icon="solar:shield-check-bold" width={18} sx={{ color: 'warning.main', mt: 0.25, flexShrink: 0 }} />
                <Typography variant="body2" color="text.secondary">
                  <strong>Permissions</strong> — All permission mappings assigned to this level will be transferred.
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Iconify icon="solar:folder-bold" width={18} sx={{ color: 'primary.main', mt: 0.25, flexShrink: 0 }} />
                <Typography variant="body2" color="text.secondary">
                  <strong>Projects</strong> — All project mappings associated with this level will be retained.
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Iconify icon="solar:hierarchy-bold" width={18} sx={{ color: 'success.main', mt: 0.25, flexShrink: 0 }} />
                <Typography variant="body2" color="text.secondary">
                  <strong>Reporting</strong> — Reporting hierarchy will automatically point to the selected level.
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={!destination || loading}
        >
          {loading ? 'Merging...' : 'Merge'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
