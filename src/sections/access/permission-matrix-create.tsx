import { useState, useMemo, useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Step from '@mui/material/Step';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Stepper from '@mui/material/Stepper';
import StepLabel from '@mui/material/StepLabel';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import CircularProgress from '@mui/material/CircularProgress';
import FormHelperText from '@mui/material/FormHelperText';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { CONFIG } from 'src/config-global';
import { PageHeader, PageContainer } from 'src/components/page-layout';
import { paths } from 'src/routes/paths';
import { useDepartmentList, useDepartmentHierarchyLevels, useRoleForHierarchy } from 'src/services/hooks/use-organization';
import { useSetRolePermissions, useRolePermissionsSummary } from 'src/services/hooks/use-permissions';
import PermissionMatrixStep2 from './permission-matrix-step2';

const STEPS = ['Basic Information', 'Permission Configuration'];

export default function PermissionMatrixCreatePage() {
  const navigate = useNavigate();
  const { id: editRoleId } = useParams<{ id: string }>();
  const isEditMode = !!editRoleId;

  const [activeStep, setActiveStep] = useState(isEditMode ? 1 : 0);
  const [departmentId, setDepartmentId] = useState<number | ''>('');
  const [levelNumber, setLevelNumber] = useState<number | ''>('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { data: departments } = useDepartmentList({});
  const departmentOptions: { id: number; name: string }[] = useMemo(
    () => departments ?? [],
    [departments],
  );

  const { data: summary } = useRolePermissionsSummary();
  const editRoleInfo = useMemo(() => {
    if (!isEditMode || !summary || !editRoleId) return null;
    return summary.find((r: any) => r.id === Number(editRoleId)) ?? null;
  }, [isEditMode, summary, editRoleId]);

  useEffect(() => {
    if (editRoleInfo && isEditMode) {
      if (editRoleInfo.departmentId) setDepartmentId(editRoleInfo.departmentId);
      if (editRoleInfo.hierarchyLevelRank) setLevelNumber(editRoleInfo.hierarchyLevelRank);
    }
  }, [editRoleInfo, isEditMode]);

  const hierarchyDeptId = isEditMode ? (editRoleInfo?.departmentId ?? undefined) : (departmentId ? Number(departmentId) : undefined);
  const { data: hierarchyLevels } = useDepartmentHierarchyLevels(hierarchyDeptId);
  const effectiveDeptId = isEditMode ? (editRoleInfo?.departmentId ?? undefined) : (departmentId ? Number(departmentId) : undefined);
  const effectiveLevel = isEditMode ? (editRoleInfo?.hierarchyLevelRank ?? undefined) : (levelNumber ? Number(levelNumber) : undefined);
  const { data: roleData, isLoading: roleLoading } = useRoleForHierarchy(
    effectiveDeptId,
    effectiveLevel,
  );

  const targetRoleId = isEditMode ? Number(editRoleId) : (roleData?.roleId ?? 0);
  const noRoleConfigured = !isEditMode && levelNumber !== '' && !roleLoading && roleData && !roleData.roleId;
  const saveMutation = useSetRolePermissions(targetRoleId);

  const levelOptions = useMemo(() => (hierarchyLevels ?? []), [hierarchyLevels]);

  const canGoNext = activeStep === 0
    ? !!departmentId && levelNumber !== '' && !!roleData?.roleId
    : true;

  const handleNext = useCallback(() => {
    if (activeStep === 0 && canGoNext) {
      setActiveStep(1);
    }
  }, [activeStep, canGoNext]);

  const handleBack = useCallback(() => {
    setActiveStep((prev) => Math.max(0, prev - 1));
  }, []);

  const handleSave = useCallback(
    (actionIds: number[]) => {
      saveMutation.mutate(actionIds, {
        onSuccess: () => {
          setSnackbar({ open: true, message: 'Permissions saved successfully.', severity: 'success' });
          setTimeout(() => navigate(paths.dashboard.permissionMatrix), 1500);
        },
        onError: () => {
          setSnackbar({ open: true, message: 'Failed to save permissions.', severity: 'error' });
        },
      });
    },
    [saveMutation, navigate],
  );

  return (
    <>
      <Helmet><title>{isEditMode ? 'Edit Mapping' : 'Create Mapping'} - Permission Matrix - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader
          title="Permission Matrix"
          description="Configure role-based permissions"
        />

        <Card sx={{ overflow: 'hidden' }}>
          <Stepper activeStep={activeStep} sx={{ px: 4, pt: 4, pb: 2 }}>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 && (
            <Box sx={{ p: 3 }}>
              <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5} sx={{ maxWidth: 900 }}>
                <FormControl>
                  <InputLabel>Department *</InputLabel>
                  <Select
                    value={isEditMode ? (editRoleInfo?.departmentName ?? '') : departmentId}
                    label="Department *"
                    onChange={(e) => {
                      const val = e.target.value as number;
                      setDepartmentId(val);
                      setLevelNumber('');
                    }}
                    disabled={isEditMode}
                  >
                    {isEditMode ? (
                      <MenuItem value={editRoleInfo?.departmentName ?? ''}>{editRoleInfo?.departmentName ?? '-'}</MenuItem>
                    ) : (
                      departmentOptions.map((dept) => (
                        <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>

                <FormControl>
                  <InputLabel>Hierarchy Level *</InputLabel>
                  <Select
                    value={isEditMode ? `L${editRoleInfo?.hierarchyLevelRank}` : levelNumber}
                    label="Hierarchy Level *"
                    onChange={(e) => setLevelNumber(e.target.value as number)}
                    disabled={isEditMode || !departmentId}
                  >
                    {isEditMode ? (
                      <MenuItem value={`L${editRoleInfo?.hierarchyLevelRank}`}>L{editRoleInfo?.hierarchyLevelRank}</MenuItem>
                    ) : (
                      levelOptions.map((hl) => (
                        <MenuItem key={hl.id} value={hl.levelNumber}>
                          L{hl.levelNumber} - {hl.roleName}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>

                <TextField
                  label="Role"
                  value={isEditMode ? (editRoleInfo?.name ?? '') : (roleLoading ? 'Loading...' : (roleData?.roleName ?? ''))}
                  inputProps={{ readOnly: true }}
                  disabled={isEditMode || !levelNumber}
                  error={!isEditMode && noRoleConfigured}
                  helperText={!isEditMode && noRoleConfigured ? 'No role is configured for the selected Department and Hierarchy Level. Please configure it in Department Master first.' : ''}
                  fullWidth
                />
              </Box>

              {noRoleConfigured && (
                <FormHelperText error sx={{ mt: 1 }}>
                  No role is configured for the selected Department and Hierarchy Level. Please configure it in Department Master first.
                </FormHelperText>
              )}
            </Box>
          )}

          {activeStep === 1 && targetRoleId > 0 && (
            <PermissionMatrixStep2
              roleId={targetRoleId}
              onSave={handleSave}
              saving={saveMutation.isPending}
            />
          )}

          <Stack direction="row" justifyContent="space-between" sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button color="inherit" onClick={() => navigate(paths.dashboard.permissionMatrix)}>
              Cancel
            </Button>
            <Stack direction="row" spacing={1}>
              {activeStep > 0 && (
                <Button onClick={handleBack} color="inherit">
                  Previous
                </Button>
              )}
              {activeStep < STEPS.length - 1 ? (
                <Button variant="contained" onClick={handleNext} disabled={!canGoNext}>
                  Next
                </Button>
              ) : null}
            </Stack>
          </Stack>
        </Card>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </PageContainer>
    </>
  );
}
