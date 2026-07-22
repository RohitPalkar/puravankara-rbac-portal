import { useState, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
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
import { CONFIG } from 'src/config-global';
import { PageHeader, PageContainer } from 'src/components/page-layout';
import { paths } from 'src/routes/paths';
import { useDepartmentList, useDepartmentHierarchyLevels, useRoleForHierarchy } from 'src/services/hooks/use-organization';

const STEPS = ['Basic Information', 'Permission Configuration'];

export default function PermissionMatrixCreatePage() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  const [departmentId, setDepartmentId] = useState<number | ''>('');
  const [levelNumber, setLevelNumber] = useState<number | ''>('');

  const { data: departmentsData } = useDepartmentList({});
  const departments: { id: number; name: string }[] = useMemo(
    () => (departmentsData as any)?.data ?? [],
    [departmentsData],
  );

  const { data: hierarchyLevels } = useDepartmentHierarchyLevels(departmentId ? Number(departmentId) : undefined);
  const { data: roleData, isLoading: roleLoading } = useRoleForHierarchy(
    departmentId ? Number(departmentId) : undefined,
    levelNumber ? Number(levelNumber) : undefined,
  );

  const levelOptions = useMemo(() => (hierarchyLevels ?? []), [hierarchyLevels]);

  const noRoleConfigured = levelNumber !== '' && !roleLoading && roleData && !roleData.roleId;

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

  return (
    <>
      <Helmet><title>Create Mapping - Permission Matrix - {CONFIG.appName}</title></Helmet>
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
                    value={departmentId}
                    label="Department *"
                    onChange={(e) => {
                      const val = e.target.value as number;
                      setDepartmentId(val);
                      setLevelNumber('');
                    }}
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <InputLabel>Hierarchy Level *</InputLabel>
                  <Select
                    value={levelNumber}
                    label="Hierarchy Level *"
                    onChange={(e) => setLevelNumber(e.target.value as number)}
                    disabled={!departmentId}
                  >
                    {levelOptions.map((hl) => (
                      <MenuItem key={hl.id} value={hl.levelNumber}>
                        L{hl.levelNumber} - {hl.roleName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Role"
                  value={roleLoading ? 'Loading...' : (roleData?.roleName ?? '')}
                  inputProps={{ readOnly: true }}
                  disabled={!levelNumber}
                  error={noRoleConfigured}
                  helperText={noRoleConfigured ? 'No role is configured for the selected Department and Hierarchy Level. Please configure it in Department Master first.' : ''}
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

          {activeStep === 1 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 8 }}>
                Permission Configuration (Step 2) coming in next update.
              </Typography>
            </Box>
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
              ) : (
                <Button variant="contained" disabled>
                  Save
                </Button>
              )}
            </Stack>
          </Stack>
        </Card>
      </PageContainer>
    </>
  );
}
