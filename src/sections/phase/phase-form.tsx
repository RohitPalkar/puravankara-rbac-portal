import type { CreatePhaseRequest, UpdatePhaseRequest } from 'src/services/types/phase';

import dayjs from 'dayjs';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { queryKeys } from 'src/services/api/query-keys';
import { brandService } from 'src/services/services/brand.service';
import { cityService } from 'src/services/services/geography.service';
import { useMyPermissions } from 'src/services/hooks/use-permissions';
import { projectService } from 'src/services/services/project.service';
import { usePhaseById, useCreatePhase, useUpdatePhase } from 'src/services/hooks/use-phases';

import { Iconify } from 'src/components/iconify';
import { PageHeader, PageContainer } from 'src/components/page-layout';

function hasPhasePermission(
  permissions: { projects: { modules: { subModules: { name: string; actions: { code: string; allowed: boolean }[] }[] }[] }[] } | undefined,
  action: string
): boolean {
  if (!permissions) return false;
  return permissions.projects.some((project) =>
    project.modules.some((mod) =>
      mod.subModules.some((sub) =>
        sub.name === 'PHASES' && sub.actions.some((a) => a.code === action && a.allowed)
      )
    )
  );
}

export default function PhaseFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const phaseId = id ? Number(id) : undefined;

  const { data: permissions } = useMyPermissions();
  const canCreate = useMemo(() => hasPhasePermission(permissions, 'CREATE'), [permissions]);

  const { data: phaseData, isLoading: isFetching, isError: isFetchError } = usePhaseById(phaseId ?? 0);
  const { mutateAsync: createPhase, isPending: isCreating } = useCreatePhase();
  const { mutateAsync: updatePhase, isPending: isUpdating } = useUpdatePhase();

  const [brandId, setBrandId] = useState<number | ''>('');
  const [cityId, setCityId] = useState<number | ''>('');
  const [projectId, setProjectId] = useState<number | ''>('');
  const [phaseName, setPhaseName] = useState('');
  const [sfdcPhaseName, setSfdcPhaseName] = useState('');
  const [sfdcBlockName, setSfdcBlockName] = useState('');
  const [possessionDate, setPossessionDate] = useState('');
  const [agreementExecutionPercentage, setAgreementExecutionPercentage] = useState<number>(0);
  const [bookingGatewayId, setBookingGatewayId] = useState('');
  const [milestoneGatewayId, setMilestoneGatewayId] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [phaseNameError, setPhaseNameError] = useState('');
  const [sfdcPhaseNameError, setSfdcPhaseNameError] = useState('');
  const [possessionDateError, setPossessionDateError] = useState('');

  const saving = isCreating || isUpdating;

  const { data: allBrands } = useQuery({
    queryKey: queryKeys.brands.list({}),
    queryFn: async () => {
      const res = await brandService.list({});
      return res.data;
    },
  });

  const { data: allProjects } = useQuery({
    queryKey: queryKeys.projects.list({}),
    queryFn: async () => {
      const res = await projectService.list({});
      return res.data;
    },
  });

  const { data: allCities } = useQuery({
    queryKey: queryKeys.cities.list({}),
    queryFn: async () => {
      const res = await cityService.list({});
      return res.data;
    },
  });

  useEffect(() => {
    if (phaseData) {
      setBrandId(phaseData.brandId);
      setCityId(phaseData.cityId);
      setProjectId(phaseData.projectId);
      setPhaseName(phaseData.phaseName);
      setSfdcPhaseName(phaseData.sfdcPhaseName);
      setSfdcBlockName(phaseData.sfdcBlockName ?? '');
      setPossessionDate(phaseData.possessionDate ? dayjs(phaseData.possessionDate).format('YYYY-MM-DD') : '');
      setAgreementExecutionPercentage(phaseData.agreementExecutionPercentage ?? 0);
      setBookingGatewayId(phaseData.bookingGatewayId?.toString() ?? '');
      setMilestoneGatewayId(phaseData.milestoneGatewayId?.toString() ?? '');
    }
  }, [phaseData]);

  const filteredProjects = useMemo(() => {
    if (!allProjects || !brandId) return [];
    return allProjects.filter((p) => p.brandId === brandId);
  }, [allProjects, brandId]);

  const filteredCities = useMemo(() => {
    if (!allCities || !projectId) return [];
    const project = allProjects?.find((p) => p.id === projectId);
    if (!project) return [];
    return allCities.filter((c) => c.id === project.cityId);
  }, [allCities, allProjects, projectId]);

  const handleBrandChange = useCallback((value: string) => {
    const num = Number(value);
    setBrandId(num || '');
    setProjectId('');
    setCityId('');
  }, []);

  const handleProjectChange = useCallback((value: string) => {
    const num = Number(value);
    setProjectId(num || '');
    setCityId('');
  }, []);

  const validate = useCallback((): boolean => {
    let valid = true;
    if (!phaseName.trim()) { setPhaseNameError('Phase name is required'); valid = false; } else { setPhaseNameError(''); }
    if (!sfdcPhaseName.trim()) { setSfdcPhaseNameError('SFDC phase name is required'); valid = false; } else { setSfdcPhaseNameError(''); }
    if (!possessionDate) { setPossessionDateError('Possession date is required'); valid = false; } else { setPossessionDateError(''); }
    return valid;
  }, [phaseName, sfdcPhaseName, possessionDate]);

  const buildPayload = useCallback((): CreatePhaseRequest => ({
    brandId: brandId as number,
    cityId: cityId as number,
    projectId: projectId as number,
    phaseName: phaseName.trim(),
    sfdcPhaseName: sfdcPhaseName.trim(),
    sfdcBlockName: sfdcBlockName.trim() || undefined,
    possessionDate,
    agreementExecutionPercentage: agreementExecutionPercentage || undefined,
    bookingGatewayId: bookingGatewayId ? Number(bookingGatewayId) : undefined,
    milestoneGatewayId: milestoneGatewayId ? Number(milestoneGatewayId) : undefined,
    isActive: true,
  }), [brandId, cityId, projectId, phaseName, sfdcPhaseName, sfdcBlockName, possessionDate, agreementExecutionPercentage, bookingGatewayId, milestoneGatewayId]);

  const handleSave = useCallback(async () => {
    if (!validate()) return;

    try {
      if (isEdit && phaseId) {
        await updatePhase({ id: phaseId, data: buildPayload() as UpdatePhaseRequest });
      } else {
        await createPhase(buildPayload());
      }
      setShowSuccess(true);
      setTimeout(() => navigate(paths.dashboard.phaseMaster), 1200);
    } catch {
      // error handled by query cache invalidation
    }
  }, [validate, isEdit, phaseId, buildPayload, createPhase, updatePhase, navigate]);

  if (isEdit && isFetching) {
    return (
      <PageContainer>
        <PageHeader title="Edit Phase" />
        <Card sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Card>
      </PageContainer>
    );
  }

  if (isEdit && (isFetchError || (!isFetching && !phaseData))) {
    return (
      <PageContainer>
        <PageHeader title="Phase Not Found" description="The requested phase does not exist" />
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">Phase with ID &quot;{id}&quot; not found.</Typography>
          <Button onClick={() => navigate(paths.dashboard.phaseMaster)} sx={{ mt: 2 }}>Back to Phases</Button>
        </Card>
      </PageContainer>
    );
  }

  if (!isEdit && !canCreate) {
    return (
      <PageContainer>
        <PageHeader title="Access Denied" />
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="error">You do not have permission to create phases.</Typography>
          <Button onClick={() => navigate(paths.dashboard.phaseMaster)} sx={{ mt: 2 }}>Back to Phases</Button>
        </Card>
      </PageContainer>
    );
  }

  return (
    <>
      <Helmet><title>{isEdit ? 'Edit Phase' : 'Create Phase'} - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader
          title={isEdit ? 'Edit Phase' : 'Create Phase'}
          description={isEdit ? 'Update phase details' : 'Add a new project phase'}
        />

        {saving && <LinearProgress />}

        <Card sx={{ p: 4 }}>
          <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={3}>
            <TextField
              label="Brand"
              value={brandId}
              onChange={(e) => handleBrandChange(e.target.value)}
              select
              required
              fullWidth
            >
              {allBrands?.map((b) => (
                <MenuItem key={b.id} value={b.id}>{b.brandName}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="City"
              value={cityId}
              onChange={(e) => setCityId(Number(e.target.value) || '')}
              select
              required
              disabled={!projectId}
              fullWidth
            >
              {filteredCities.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Project"
              value={projectId}
              onChange={(e) => handleProjectChange(e.target.value)}
              select
              required
              disabled={!brandId}
              fullWidth
            >
              {filteredProjects.map((p) => (
                <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Phase Name"
              value={phaseName}
              onChange={(e) => { setPhaseName(e.target.value); setPhaseNameError(''); }}
              error={!!phaseNameError}
              helperText={phaseNameError}
              required
              fullWidth
            />
            <TextField
              label="SFDC Phase Name"
              value={sfdcPhaseName}
              onChange={(e) => { setSfdcPhaseName(e.target.value); setSfdcPhaseNameError(''); }}
              error={!!sfdcPhaseNameError}
              helperText={sfdcPhaseNameError}
              required
              fullWidth
            />
            <TextField
              label="SFDC Block Name"
              value={sfdcBlockName}
              onChange={(e) => setSfdcBlockName(e.target.value)}
              fullWidth
            />
            <TextField
              label="Possession Date"
              type="date"
              value={possessionDate}
              onChange={(e) => { setPossessionDate(e.target.value); setPossessionDateError(''); }}
              error={!!possessionDateError}
              helperText={possessionDateError}
              InputLabelProps={{ shrink: true }}
              required
              fullWidth
            />
            <TextField
              label="Agreement Execution at X% AV"
              value={agreementExecutionPercentage}
              onChange={(e) => setAgreementExecutionPercentage(Number(e.target.value))}
              type="number"
              inputProps={{ min: 0, max: 100 }}
              fullWidth
            />
            <TextField
              label="Easebuzz Booking Merchant ID"
              value={bookingGatewayId}
              onChange={(e) => setBookingGatewayId(e.target.value)}
              fullWidth
            />
            <TextField
              label="Easebuzz Milestone Merchant ID"
              value={milestoneGatewayId}
              onChange={(e) => setMilestoneGatewayId(e.target.value)}
              fullWidth
            />
          </Box>
        </Card>

        <Box sx={{ position: 'sticky', bottom: 0, zIndex: 10, bgcolor: 'background.default', borderTop: '1px solid', borderColor: 'divider', py: 2, px: 0, mt: 3 }}>
          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => navigate(paths.dashboard.phaseMaster)} size="large">
              Cancel
            </Button>
            <Button variant="contained" startIcon={<Iconify icon="solar:check-circle-bold" />} onClick={handleSave} disabled={saving} size="large">
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </Stack>
        </Box>
      </PageContainer>

      <Snackbar open={showSuccess} autoHideDuration={2000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" sx={{ width: 1 }}>
          Phase {isEdit ? 'updated' : 'created'} successfully
        </Alert>
      </Snackbar>
    </>
  );
}
