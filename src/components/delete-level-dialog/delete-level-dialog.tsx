import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Radio from '@mui/material/Radio';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import RadioGroup from '@mui/material/RadioGroup';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormHelperText from '@mui/material/FormHelperText';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useLevelImpact, useLevelRemoveCheck } from 'src/services/hooks/use-organization';

import { Iconify } from 'src/components/iconify';

interface Props {
  open: boolean;
  departmentId: number | null;
  levelNumber: number | null;
  levelName: string;
  onClose: () => void;
  onConfirm: (payload: { mode: 'MERGE' | 'REPLACE'; destinationLevelNumber: number }) => void;
  loading?: boolean;
}

export function DeleteLevelDialog({ open, departmentId, levelNumber, levelName, onClose, onConfirm, loading }: Props) {
  const [mode, setMode] = useState<'MERGE' | 'REPLACE'>('MERGE');
  const [destinationLevelNumber, setDestinationLevelNumber] = useState<number | null>(null);

  const { data: impact } = useLevelImpact(departmentId ?? undefined, levelNumber ?? undefined);
  const { data: checkResult } = useLevelRemoveCheck(departmentId ?? undefined, levelNumber ?? undefined);

  const mergeCandidates = impact?.mergeCandidates ?? [];
  const autoMerge = checkResult?.autoMerge ?? false;
  const suggestedDestination = checkResult?.destinationLevelNumber;

  useEffect(() => {
    if (open) {
      setMode('MERGE');
      setDestinationLevelNumber(null);
    }
  }, [open]);

  useEffect(() => {
    if (autoMerge && suggestedDestination) {
      setDestinationLevelNumber(suggestedDestination);
    }
  }, [autoMerge, suggestedDestination]);

  const handleConfirm = () => {
    if (!destinationLevelNumber) return;
    onConfirm({ mode, destinationLevelNumber });
  };

  const impactItems = [
    { label: 'Current users on this level', value: impact?.usersCount ?? 0, icon: 'solar:users-group-rounded-bold' },
    { label: 'Active approval workflows', value: impact?.approvalsCount ?? 0, icon: 'solar:checklist-bold' },
    { label: 'Users in child levels', value: impact?.childLevelUsersCount ?? 0, icon: 'solar:users-group-two-rounded-bold' },
    { label: 'Zones impacted', value: impact?.zonesImpacted ?? 0, icon: 'solar:map-point-wave-bold' },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Iconify icon="solar:trash-bin-trash-bold" sx={{ color: 'error.main' }} />
        Remove Hierarchy Level
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Alert severity="warning" icon={<Iconify icon="solar:danger-triangle-bold" />}>
            <Typography variant="body2" fontWeight={600}>
              Level {levelNumber}: &quot;{levelName}&quot;
            </Typography>
            <Typography variant="body2">
              This hierarchy level is currently in use. Choose how to handle affected users and roles.
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
                    <Typography variant="subtitle2">Merge Level</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Combine roles, permissions, and users into an adjacent level. Nothing is lost.
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
                    <Typography variant="subtitle2">Replace Level</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Reassign users to another level. Level-specific roles and permissions are discarded.
                    </Typography>
                  </Box>
                }
                sx={{ alignItems: 'flex-start', mx: 0 }}
              />
            </Card>
          </RadioGroup>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
              {mode === 'MERGE' ? 'Merge into Level' : 'Replace with Level'}
            </Typography>

            {autoMerge && suggestedDestination ? (
              <Alert severity="info" icon={<Iconify icon="solar:magic-stick-3-bold" />} sx={{ mb: 1 }}>
                <Typography variant="body2">
                  Auto-merge detected. Level {suggestedDestination} is the recommended destination.
                </Typography>
              </Alert>
            ) : null}

            <Stack spacing={1}>
              {mergeCandidates.map((candidate) => (
                <Card
                  key={candidate}
                  onClick={() => setDestinationLevelNumber(candidate)}
                  sx={{
                    p: 1.5,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: destinationLevelNumber === candidate ? 'primary.main' : 'divider',
                    bgcolor: destinationLevelNumber === candidate ? 'action.selected' : 'background.paper',
                    '&:hover': { borderColor: 'primary.light' },
                  }}
                >
                  <FormControlLabel
                    value={candidate}
                    control={<Radio checked={destinationLevelNumber === candidate} />}
                    label={<Typography variant="body2">Level {candidate}</Typography>}
                    sx={{ mx: 0 }}
                  />
                </Card>
              ))}
            </Stack>

            {mode === 'MERGE' && destinationLevelNumber && (
              <FormHelperText>
                Roles and permissions from both levels will be combined.
              </FormHelperText>
            )}
            {mode === 'REPLACE' && destinationLevelNumber && (
              <FormHelperText>
                Users will be reassigned. Level-specific permissions will be discarded.
              </FormHelperText>
            )}
          </Box>

          {impact && (
            <Box>
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Impact Summary
              </Typography>
              <Stack spacing={0.5}>
                {impactItems.map((item) =>
                  item.value > 0 ? (
                    <Stack key={item.label} direction="row" alignItems="center" spacing={1}>
                      <Iconify icon={item.icon} width={16} sx={{ color: 'text.secondary', flexShrink: 0 }} />
                      <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                        {item.label}
                      </Typography>
                      <Typography variant="caption" fontWeight={600}>
                        {item.value}
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
        <Tooltip title={!destinationLevelNumber ? 'Select a destination level first' : ''}>
          <span>
            <Button
              onClick={handleConfirm}
              variant="contained"
              color="error"
              disabled={!destinationLevelNumber || loading}
            >
              {loading ? 'Processing...' : mode === 'MERGE' ? 'Merge Level' : 'Replace Level'}
            </Button>
          </span>
        </Tooltip>
      </DialogActions>
    </Dialog>
  );
}
