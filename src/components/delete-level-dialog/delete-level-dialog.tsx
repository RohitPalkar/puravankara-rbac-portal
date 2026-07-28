import { useMemo, useState, useEffect } from 'react';

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

  const mergeCandidates = useMemo(() => impact?.availableDestinations ?? [], [impact?.availableDestinations]);
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
      const candidate = mergeCandidates.find((c: any) => c.levelNumber === suggestedDestination);
      if (candidate) setDestinationLevelNumber(candidate.levelNumber);
    }
  }, [autoMerge, suggestedDestination, mergeCandidates]);

  const handleConfirm = () => {
    if (!destinationLevelNumber) return;
    onConfirm({ mode, destinationLevelNumber });
  };

  const impactItems = impact ? [
    { label: 'Users on this role', value: impact.dependencies?.users?.count ?? 0, icon: 'solar:users-group-rounded-bold', color: '#2F3C98' },
    { label: 'Permission actions', value: impact.dependencies?.permissions?.count ?? 0, icon: 'solar:shield-check-bold', color: '#7B1FA2' },
    { label: 'Projects assigned', value: impact.dependencies?.projects?.count ?? 0, icon: 'solar:folder-bold', color: '#F57C00' },
    { label: 'Active approvals', value: impact.dependencies?.approvals?.active ?? 0, icon: 'solar:checklist-bold', color: '#00BCD4' },
    { label: 'Reporting lines', value: impact.dependencies?.reporting?.count ?? 0, icon: 'solar:hierarchy-bold', color: '#388E3C' },
  ] : [];

  const selectedDestination = mergeCandidates.find((c: any) => c.levelNumber === destinationLevelNumber);

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
              &quot;{levelName}&quot; (Level {levelNumber})
            </Typography>
            <Typography variant="body2">
              This role is currently in use. Choose how to handle affected users, permissions, and data.
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
                      Combine roles, permissions, and users into an adjacent role. Nothing is lost.
                      {selectedDestination && mode === 'MERGE' && (
                        <> Destination role permissions remain unchanged — merged permissions are added.</>
                      )}
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
                      Users will be moved to the destination role. Source role permissions and project access
                      are discarded. Destination role permissions remain unchanged.
                    </Typography>
                  </Box>
                }
                sx={{ alignItems: 'flex-start', mx: 0 }}
              />
            </Card>
          </RadioGroup>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
              {mode === 'MERGE' ? 'Merge into Role' : 'Replace with Role'}
            </Typography>

            {autoMerge && suggestedDestination ? (
              <Alert severity="info" icon={<Iconify icon="solar:magic-stick-3-bold" />} sx={{ mb: 1 }}>
                <Typography variant="body2">
                  Auto-merge detected. &quot;{mergeCandidates.find((c: any) => c.levelNumber === suggestedDestination)?.roleName ?? `Level ${suggestedDestination}`}&quot; is the recommended destination.
                  This role has no active dependencies.
                </Typography>
              </Alert>
            ) : null}

            {mergeCandidates.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                No other roles available in this department.
              </Typography>
            ) : (
              <Stack spacing={1}>
                {mergeCandidates.map((candidate: any) => (
                  <Card
                    key={candidate.id}
                    onClick={() => setDestinationLevelNumber(candidate.levelNumber)}
                    sx={{
                      p: 1.5,
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: destinationLevelNumber === candidate.levelNumber ? 'primary.main' : 'divider',
                      bgcolor: destinationLevelNumber === candidate.levelNumber ? 'action.selected' : 'background.paper',
                      '&:hover': { borderColor: 'primary.light' },
                    }}
                  >
                    <FormControlLabel
                      value={candidate.levelNumber}
                      control={<Radio checked={destinationLevelNumber === candidate.levelNumber} />}
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {candidate.roleName || `Level ${candidate.levelNumber}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Level {candidate.levelNumber}
                          </Typography>
                        </Box>
                      }
                      sx={{ mx: 0 }}
                    />
                  </Card>
                ))}
              </Stack>
            )}

            {mode === 'MERGE' && destinationLevelNumber && (
              <FormHelperText sx={{ mt: 1 }}>
                <Iconify icon="solar:info-circle-bold" width={14} style={{ verticalAlign: 'text-bottom', marginRight: 4 }} />
                Users, permissions, and project access will be combined. Approval steps will be migrated.
              </FormHelperText>
            )}
            {mode === 'REPLACE' && destinationLevelNumber && (
              <FormHelperText sx={{ mt: 1 }}>
                <Iconify icon="solar:info-circle-bold" width={14} style={{ verticalAlign: 'text-bottom', marginRight: 4 }} />
                Users will be reassigned. Source role permissions will be discarded. Destination role permissions remain unchanged.
              </FormHelperText>
            )}
          </Box>

          {impact && impact.dependencies && (
            <Box>
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                Impact Summary
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                {impactItems.map((item) => (
                  <Box
                    key={item.label}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 1,
                      borderRadius: 1,
                      bgcolor: 'action.hover',
                    }}
                  >
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: 0.75,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: `${item.color}14`,
                      }}
                    >
                      <Iconify icon={item.icon} width={14} sx={{ color: item.color }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{item.value}</Typography>
                      <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Cancel
        </Button>
        <Tooltip title={!destinationLevelNumber ? 'Select a destination role first' : ''}>
          <span>
            <Button
              onClick={handleConfirm}
              variant="contained"
              color="error"
              disabled={!destinationLevelNumber || loading}
            >
              {loading ? 'Processing...' : mode === 'MERGE' ? 'Merge Role' : 'Replace Role'}
            </Button>
          </span>
        </Tooltip>
      </DialogActions>
    </Dialog>
  );
}
