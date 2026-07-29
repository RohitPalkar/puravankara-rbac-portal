import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Step from '@mui/material/Step';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Stepper from '@mui/material/Stepper';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import StepLabel from '@mui/material/StepLabel';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { useProjectList } from 'src/services/hooks/use-projects';
import { useRoleList, useDepartmentList } from 'src/services/hooks/use-organization';
import { useSetRolePermissions, useRolePermissionsSummary } from 'src/services/hooks/use-permissions';

import { PageHeader, PageContainer } from 'src/components/page-layout';

import PermissionMatrixStep2 from './permission-matrix-step2';

const STEPS = ['Basic Information', 'Permission Configuration'];

export default function PermissionMatrixCreatePage() {
  const navigate = useNavigate();
  const { id: editRoleId } = useParams<{ id: string }>();
  const isEditMode = !!editRoleId;

  const [activeStep, setActiveStep] = useState(isEditMode ? 1 : 0);
  const [projectId, setProjectId] = useState<number | ''>('');
  const [departmentId, setDepartmentId] = useState<number | ''>('');
  const [roleId, setRoleId] = useState<number | ''>('');
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

  const { data: projects } = useProjectList({});
  const projectOptions: { id: number; name: string }[] = useMemo(
    () => projects ?? [],
    [projects],
  );

  const { data: allRoles } = useRoleList({});
  const filteredRoleOptions = useMemo(() => {
    if (!allRoles || !departmentId) return [];
    return (allRoles as { id: number; name: string; departmentId?: number | null }[]).filter(
      (r) => r.departmentId === Number(departmentId),
    );
  }, [allRoles, departmentId]);

  const { data: summary } = useRolePermissionsSummary();
  const editRoleInfo = useMemo(() => {
    if (!isEditMode || !summary || !editRoleId) return null;
    return summary.find((r: any) => r.id === Number(editRoleId)) ?? null;
  }, [isEditMode, summary, editRoleId]);

  useEffect(() => {
    if (editRoleInfo && isEditMode) {
      if (editRoleInfo.departmentId) setDepartmentId(editRoleInfo.departmentId);
      if (editRoleInfo.id) setRoleId(editRoleInfo.id);
    }
  }, [editRoleInfo, isEditMode]);

  const targetRoleId = isEditMode ? Number(editRoleId) : (roleId ? Number(roleId) : 0);
  const saveMutation = useSetRolePermissions(targetRoleId);

  const canGoNext = activeStep === 0
    ? !!projectId && !!departmentId && !!roleId
    : true;

  const handleNext = useCallback(() => {
    if (activeStep === 0 && canGoNext) {
      setActiveStep(1);
    }
  }, [activeStep, canGoNext]);

  const handleBack = useCallback(() => {
    setActiveStep((prev) => Math.max(0, prev - 1));
  }, []);

  const selectedRoleName = useMemo(() => {
    if (!allRoles || !roleId) return '';
    const role = (allRoles as { id: number; name: string }[]).find((r) => r.id === Number(roleId));
    return role?.name ?? '';
  }, [allRoles, roleId]);

  const selectedProjectName = useMemo(() => {
    if (!projectOptions || !projectId) return '';
    const proj = projectOptions.find((p) => p.id === Number(projectId));
    return proj?.name ?? '';
  }, [projectOptions, projectId]);

  const selectedDepartmentName = useMemo(() => {
    if (!departmentOptions || !departmentId) return '';
    const dept = departmentOptions.find((d) => d.id === Number(departmentId));
    return dept?.name ?? '';
  }, [departmentOptions, departmentId]);

  const handleSave = useCallback(
    (actionIds: number[]) => {
      saveMutation.mutate(actionIds, {
        onSuccess: () => {
          setSnackbar({
            open: true,
            message: `Permissions for "${selectedRoleName}" saved successfully (${actionIds.length} actions).`,
            severity: 'success',
          });
          setTimeout(() => navigate(paths.dashboard.permissionMatrix), 2000);
        },
        onError: () => {
          setSnackbar({ open: true, message: `Failed to save permissions for "${selectedRoleName}".`, severity: 'error' });
        },
      });
    },
    [saveMutation, navigate, selectedRoleName],
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
                <Autocomplete
                  options={projectOptions}
                  getOptionLabel={(option) => option.name}
                  value={projectOptions.find((p) => p.id === Number(projectId)) ?? null}
                  onChange={(_e, val) => setProjectId(val ? val.id : '')}
                  disabled={isEditMode}
                  renderInput={(params) => (
                    <TextField {...params} label="Project *" required />
                  )}
                />

                <FormControl>
                  <InputLabel>Department *</InputLabel>
                  <Select
                    value={isEditMode ? (editRoleInfo?.departmentName ?? '') : departmentId}
                    label="Department *"
                    onChange={(e) => {
                      const val = e.target.value as number;
                      setDepartmentId(val);
                      setRoleId('');
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

                <Autocomplete
                  options={filteredRoleOptions}
                  getOptionLabel={(option) => option.name}
                  value={filteredRoleOptions.find((r) => r.id === Number(roleId)) ?? null}
                  onChange={(_e, val) => setRoleId(val ? val.id : '')}
                  disabled={isEditMode || !departmentId}
                  noOptionsText={!departmentId ? 'Select a department first' : 'No roles available'}
                  renderInput={(params) => (
                    <TextField {...params} label="Role *" required />
                  )}
                />
              </Box>
            </Box>
          )}

          {activeStep === 1 && targetRoleId > 0 && (
            <PermissionMatrixStep2
              roleId={targetRoleId}
              roleName={selectedRoleName}
              projectName={selectedProjectName}
              departmentName={selectedDepartmentName}
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
