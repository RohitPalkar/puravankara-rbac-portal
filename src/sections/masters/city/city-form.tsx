import type { CityGenericApproval,CreateMasterCityRequest, UpdateMasterCityRequest } from 'src/services/types/master';

import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Step from '@mui/material/Step';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stepper from '@mui/material/Stepper';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import Skeleton from '@mui/material/Skeleton';
import StepLabel from '@mui/material/StepLabel';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { useMasterCityById, useCreateMasterCity, useUpdateMasterCity } from 'src/services/hooks/use-masters';

import { Iconify } from 'src/components/iconify';
import { FormSection } from 'src/components/form-section';
import { PageHeader, PageContainer } from 'src/components/page-layout';

import ApprovalDepartmentStep from './components/approval-department-step';

const COUNTRIES = ['India'];
const STEPS = ['City Details', 'Approval & Department Mapping'];

export default function CityFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const cityId = id ? Number(id) : undefined;

  const { data: cityData, isLoading: isFetching, isError: isFetchError } = useMasterCityById(cityId ?? 0);
  const { mutateAsync: createCity, isPending: isCreating } = useCreateMasterCity();
  const { mutateAsync: updateCity, isPending: isUpdating } = useUpdateMasterCity();

  const [activeStep, setActiveStep] = useState(0);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  const [isActive, setIsActive] = useState(true);
  const [genericApprovals, setGenericApprovals] = useState<CityGenericApproval[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const [codeError, setCodeError] = useState('');
  const [nameError, setNameError] = useState('');
  const [stateError, setStateError] = useState('');
  const [stepError, setStepError] = useState('');

  const saving = isCreating || isUpdating;

  useEffect(() => {
    if (cityData) {
      setCode(cityData.code);
      setName(cityData.name);
      setState(cityData.state);
      setCountry(cityData.country);
      setIsActive(cityData.isActive);
      setGenericApprovals(cityData.genericApprovals ?? []);
    }
  }, [cityData]);

  const validateStep0 = useCallback(() => {
    let valid = true;
    if (!code.trim()) { setCodeError('Code is required'); valid = false; } else setCodeError('');
    if (!name.trim()) { setNameError('City name is required'); valid = false; } else setNameError('');
    if (!state.trim()) { setStateError('State is required'); valid = false; } else setStateError('');
    return valid;
  }, [code, name, state]);

  const handleNext = useCallback(() => {
    setStepError('');
    if (activeStep === 0) {
      if (!validateStep0()) return;
    }
    setActiveStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  }, [activeStep, validateStep0]);

  const handleBack = useCallback(() => {
    setStepError('');
    setActiveStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleSave = useCallback(async () => {
    setStepError('');
    if (!validateStep0()) {
      setActiveStep(0);
      return;
    }
    // optional: validate at least one department has name if approvals exist
    const hasInvalidDept = genericApprovals.some((ga) => ga.departments.some((d) => !d.departmentName.trim()));
    if (hasInvalidDept) {
      setStepError('Each department must have a name. Fix Generic Approval entries.');
      setActiveStep(1);
      return;
    }
    const hasInvalidTemplate = genericApprovals.some((ga) =>
      ga.departments.some((d) => d.templates.some((t) => !t.name.trim() || !t.fileName.trim()))
    );
    if (hasInvalidTemplate) {
      setStepError('Each template needs name + file. Fix Generic Approval templates.');
      setActiveStep(1);
      return;
    }

    const payload: CreateMasterCityRequest = {
      code: code.trim().toUpperCase(),
      name: name.trim(),
      state: state.trim(),
      country,
      isActive,
      genericApprovals,
    };

    try {
      if (isEdit && cityId) {
        await updateCity({ id: cityId, data: payload as UpdateMasterCityRequest });
      } else {
        await createCity(payload);
      }
      setShowSuccess(true);
      setTimeout(() => navigate(paths.dashboard.masters.cities), 1200);
    } catch (e: any) {
      setStepError(e?.message ?? 'Failed to save city');
    }
  }, [code, name, state, country, isActive, genericApprovals, isEdit, cityId, createCity, updateCity, navigate, validateStep0]);

  if (isEdit && isFetching) {
    return (
      <PageContainer>
        <PageHeader title="Edit City" />
        <Card sx={{ p: 4 }}>
          <Stack spacing={2}>
            <Skeleton variant="rectangular" height={52} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" height={52} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" height={52} sx={{ borderRadius: 1 }} />
          </Stack>
        </Card>
      </PageContainer>
    );
  }

  if (isEdit && (isFetchError || (!isFetching && !cityData))) {
    return (
      <PageContainer>
        <PageHeader title="City Not Found" description="The requested city does not exist" />
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">City with ID &quot;{id}&quot; not found.</Typography>
          <Button onClick={() => navigate(paths.dashboard.masters.cities)} sx={{ mt: 2 }}>Back to Cities</Button>
        </Card>
      </PageContainer>
    );
  }

  return (
    <>
      <Helmet><title>{isEdit ? 'Edit City' : 'Add City'} - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader
          title={isEdit ? 'Edit City' : 'Add City'}
          description={isEdit ? 'Update city details — 2 steps' : 'Add a new city — 2 steps: City Details + Approval & Department Mapping'}
        />

        {saving && <LinearProgress sx={{ mb: 2 }} />}

        <Card sx={{ overflow: 'hidden' }}>
          <Stepper activeStep={activeStep} sx={{ px: { xs: 2, sm: 4 }, pt: 3, pb: 2 }}>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {stepError && (
            <Alert severity="error" sx={{ mx: 3, mb: 2 }} onClose={() => setStepError('')}>{stepError}</Alert>
          )}

          <Box sx={{ p: { xs: 2.5, sm: 4 } }}>
            {activeStep === 0 && (
              <FormSection title="City Information">
                <TextField
                  label="City Code"
                  value={code}
                  onChange={(e) => { setCode(e.target.value.toUpperCase()); setCodeError(''); }}
                  error={!!codeError}
                  helperText={codeError || ' '}
                  required
                  placeholder="e.g. BLR"
                />
                <TextField
                  label="City Name"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setNameError(''); }}
                  error={!!nameError}
                  helperText={nameError || ' '}
                  required
                  placeholder="e.g. Bengaluru"
                />
                <TextField
                  label="State"
                  value={state}
                  onChange={(e) => { setState(e.target.value); setStateError(''); }}
                  error={!!stateError}
                  helperText={stateError || ' '}
                  required
                  placeholder="e.g. Karnataka"
                />
                <TextField
                  label="Country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  select
                  required
                >
                  {COUNTRIES.map((c) => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                  ))}
                </TextField>
                {isEdit && (
                  <TextField
                    select
                    label="Status"
                    value={isActive ? 'active' : 'inactive'}
                    onChange={(e) => setIsActive(e.target.value === 'active')}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </TextField>
                )}
              </FormSection>
            )}

            {activeStep === 1 && (
              <ApprovalDepartmentStep value={genericApprovals} onChange={setGenericApprovals} />
            )}
          </Box>

          <Stack direction="row" justifyContent="space-between" sx={{ p: 2.5, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
            <Button color="inherit" onClick={() => navigate(paths.dashboard.masters.cities)}>Cancel</Button>
            <Stack direction="row" spacing={1}>
              {activeStep > 0 && (
                <Button onClick={handleBack} color="inherit" variant="outlined" startIcon={<Iconify icon="eva:arrow-back-fill" />}>
                  Previous
                </Button>
              )}
              {activeStep < STEPS.length - 1 ? (
                <Button variant="contained" onClick={handleNext} endIcon={<Iconify icon="eva:arrow-forward-fill" />}>
                  Next
                </Button>
              ) : (
                <Button variant="contained" startIcon={<Iconify icon="solar:check-circle-bold" />} onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : isEdit ? 'Save City' : 'Create City'}
                </Button>
              )}
            </Stack>
          </Stack>
        </Card>

        {/* Helper read-only preview for user role — collapsible */}
        <Card sx={{ mt: 3, p: 2.5, bgcolor: 'background.paper' }}>
          <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Iconify icon="solar:eye-bold" width={18} /> User View Preview (read-only)
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            What a non-admin will see: same approvals but without upload/edit. Admin uploads, user views.
          </Typography>
          <ApprovalDepartmentStep value={genericApprovals} onChange={() => {}} readOnly />
        </Card>
      </PageContainer>

      <Snackbar open={showSuccess} autoHideDuration={2000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" sx={{ width: 1 }}>
          City {isEdit ? 'updated' : 'created'} successfully
        </Alert>
      </Snackbar>
    </>
  );
}
