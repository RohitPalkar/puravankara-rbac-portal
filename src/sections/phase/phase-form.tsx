import type { Phase } from 'src/types';

import { Helmet } from 'react-helmet-async';
import { useMemo, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Switch from '@mui/material/Switch';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControlLabel from '@mui/material/FormControlLabel';
import LinearProgress from '@mui/material/LinearProgress';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { mockBrands, mockCities, mockProjects, mockPhases } from 'src/services/mock-data';

import { Iconify } from 'src/components/iconify';
import { FormSection } from 'src/components/form-section';
import { PageHeader, PageContainer } from 'src/components/page-layout';

export default function PhaseFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [phaseData] = useState<Phase | undefined>(
    isEdit ? mockPhases.find((p) => p.id === id) : undefined
  );

  const [brandId, setBrandId] = useState(phaseData?.brandId ?? '');
  const [cityId, setCityId] = useState(phaseData?.cityId ?? '');
  const [projectId, setProjectId] = useState(phaseData?.projectId ?? '');
  const [phaseName, setPhaseName] = useState(phaseData?.phaseName ?? '');
  const [sfdcPhaseName, setSfdcPhaseName] = useState(phaseData?.sfdcPhaseName ?? '');
  const [sfdcBlockName, setSfdcBlockName] = useState(phaseData?.sfdcBlockName ?? '');
  const [possessionDate, setPossessionDate] = useState(phaseData?.possessionDate ?? '');
  const [agreementExecutionPercentage, setAgreementExecutionPercentage] = useState(phaseData?.agreementExecutionPercentage ?? 0);
  const [bookingGatewayId, setBookingGatewayId] = useState(phaseData?.bookingGatewayId ?? '');
  const [milestoneGatewayId, setMilestoneGatewayId] = useState(phaseData?.milestoneGatewayId ?? '');
  const [launchEnabled, setLaunchEnabled] = useState(phaseData?.launchEnabled ?? false);
  const [launchStartDate, setLaunchStartDate] = useState(phaseData?.launchStartDate ?? '');
  const [launchEndDate, setLaunchEndDate] = useState(phaseData?.launchEndDate ?? '');
  const [sustenanceEnabled, setSustenanceEnabled] = useState(phaseData?.sustenanceEnabled ?? false);
  const [sustenanceDate, setSustenanceDate] = useState(phaseData?.sustenanceDate ?? '');

  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [phaseNameError, setPhaseNameError] = useState('');
  const [showLaunchDialog, setShowLaunchDialog] = useState(false);

  const citiesForBrand = useMemo(
    () => brandId ? mockCities : [],
    [brandId]
  );

  const projectsForCity = useMemo(
    () => cityId ? mockProjects : [],
    [cityId]
  );

  const handleSave = useCallback(() => {
    if (!phaseName.trim()) {
      setPhaseNameError('Phase name is required');
      return;
    }
    setPhaseNameError('');

    setSaving(true);
    setTimeout(() => {
      const brand = mockBrands.find((b) => b.id === brandId);
      const city = mockCities.find((c) => c.id === cityId);
      const project = mockProjects.find((p) => p.id === projectId);

      if (isEdit && phaseData) {
        Object.assign(phaseData, {
          brandId, brandName: brand?.brandName, cityId, cityName: city?.name,
          projectId, projectName: project?.name, phaseName: phaseName.trim(),
          sfdcPhaseName, sfdcBlockName, possessionDate, agreementExecutionPercentage,
          bookingGatewayId, milestoneGatewayId, launchEnabled, launchStartDate, launchEndDate,
          sustenanceEnabled, sustenanceDate, updatedAt: new Date().toISOString(),
        });
      } else {
        mockPhases.unshift({
          id: String(Date.now()),
          brandId, brandName: brand?.brandName ?? '', cityId, cityName: city?.name ?? '',
          projectId, projectName: project?.name ?? '', phaseName: phaseName.trim(),
          sfdcPhaseName, sfdcBlockName, possessionDate, agreementExecutionPercentage,
          bookingGatewayId, milestoneGatewayId, launchEnabled, launchStartDate, launchEndDate,
          sustenanceEnabled, sustenanceDate, status: 'active', createdBy: 'Rohit Palkar',
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        });
      }

      setSaving(false);
      setShowSuccess(true);
      setTimeout(() => navigate(paths.dashboard.phaseMaster), 1200);
    }, 800);
  }, [brandId, cityId, projectId, phaseName, sfdcPhaseName, sfdcBlockName, possessionDate,
    agreementExecutionPercentage, bookingGatewayId, milestoneGatewayId, launchEnabled,
    launchStartDate, launchEndDate, sustenanceEnabled, sustenanceDate, isEdit, phaseData, navigate]);

  if (isEdit && !phaseData) {
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

  return (
    <>
      <Helmet><title>{isEdit ? 'Edit Phase' : 'Create Phase'} - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader
          title={isEdit ? 'Edit Phase' : 'Create Phase'}
          description={isEdit ? 'Update phase details and launch configuration' : 'Add a new project phase'}
        />

        {saving && <LinearProgress />}

        <Stack spacing={3}>
          <Card sx={{ p: 3 }}>
            <FormSection title="Phase Details" description="Basic phase information">
              <TextField label="Brand" value={brandId} onChange={(e) => { setBrandId(e.target.value); setCityId(''); setProjectId(''); }} select required fullWidth>
                {mockBrands.map((b) => <MenuItem key={b.id} value={b.id}>{b.brandName}</MenuItem>)}
              </TextField>
              <TextField label="City" value={cityId} onChange={(e) => { setCityId(e.target.value); setProjectId(''); }} select required disabled={!brandId} fullWidth>
                {citiesForBrand.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </TextField>
              <TextField label="Project" value={projectId} onChange={(e) => setProjectId(e.target.value)} select required disabled={!cityId} fullWidth>
                {projectsForCity.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
              </TextField>
              <TextField label="Phase Name" value={phaseName} onChange={(e) => { setPhaseName(e.target.value); setPhaseNameError(''); }} error={!!phaseNameError} helperText={phaseNameError} required fullWidth />
              <TextField label="SFDC Phase Name" value={sfdcPhaseName} onChange={(e) => setSfdcPhaseName(e.target.value)} required fullWidth />
              <TextField label="SFDC Block Name" value={sfdcBlockName} onChange={(e) => setSfdcBlockName(e.target.value)} fullWidth />
              <TextField label="Possession Date" value={possessionDate} onChange={(e) => setPossessionDate(e.target.value)} type="date" InputLabelProps={{ shrink: true }} required fullWidth />
              <TextField label="Agreement Execution at X% AV" value={agreementExecutionPercentage} onChange={(e) => setAgreementExecutionPercentage(Number(e.target.value))} type="number" inputProps={{ min: 0, max: 100 }} fullWidth />
            </FormSection>
          </Card>

          <Card sx={{ p: 3 }}>
            <FormSection title="Payment Gateway Configuration" description="Easebuzz merchant IDs for booking and milestone payments">
              <TextField label="Easebuzz Booking Merchant ID" value={bookingGatewayId} onChange={(e) => setBookingGatewayId(e.target.value)} fullWidth />
              <TextField label="Easebuzz Milestone Merchant ID" value={milestoneGatewayId} onChange={(e) => setMilestoneGatewayId(e.target.value)} fullWidth />
            </FormSection>
          </Card>

          <Card sx={{ p: 3 }}>
            <Stack spacing={2.5}>
              <Stack spacing={0.5}>
                <Typography variant="subtitle1">Launch Configuration</Typography>
                <Typography variant="body2" color="text.secondary">Configure launch availability for this phase</Typography>
              </Stack>
              <FormControlLabel control={<Switch checked={launchEnabled} onChange={(e) => { setLaunchEnabled(e.target.checked); if (!e.target.checked) { setLaunchStartDate(''); setLaunchEndDate(''); } }} />} label="Launch Enabled" />
              {launchEnabled && (
                <Stack direction="row" spacing={2.5} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                  <TextField label="Launch Start Date" value={launchStartDate} onChange={(e) => setLaunchStartDate(e.target.value)} type="date" InputLabelProps={{ shrink: true }} required={launchEnabled} fullWidth />
                  <TextField label="Launch End Date" value={launchEndDate} onChange={(e) => setLaunchEndDate(e.target.value)} type="date" InputLabelProps={{ shrink: true }} required={launchEnabled} fullWidth />
                </Stack>
              )}
              <FormControlLabel control={<Switch checked={sustenanceEnabled} onChange={(e) => setSustenanceEnabled(e.target.checked)} />} label="Sustenance Enabled" />
              {sustenanceEnabled && (
                <TextField label="Sustenance Date" value={sustenanceDate} onChange={(e) => setSustenanceDate(e.target.value)} type="date" InputLabelProps={{ shrink: true }} fullWidth sx={{ maxWidth: 300 }} />
              )}
            </Stack>
          </Card>
        </Stack>

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

      <Dialog open={showLaunchDialog} onClose={() => setShowLaunchDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Launch Period</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <FormControlLabel control={<Switch checked={launchEnabled} onChange={(e) => setLaunchEnabled(e.target.checked)} />} label="Enable Launch" />
            {launchEnabled && (
              <Stack direction="row" spacing={2}>
                <TextField label="Start Date" value={launchStartDate} onChange={(e) => setLaunchStartDate(e.target.value)} type="date" InputLabelProps={{ shrink: true }} fullWidth />
                <TextField label="End Date" value={launchEndDate} onChange={(e) => setLaunchEndDate(e.target.value)} type="date" InputLabelProps={{ shrink: true }} fullWidth />
              </Stack>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLaunchDialog(false)} color="inherit">Cancel</Button>
          <Button onClick={() => setShowLaunchDialog(false)} variant="contained">Apply</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
