
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { isApiMode } from 'src/services/data-source';
import { useZones, useCities, useProjects } from 'src/services/api-adapters';

import { Iconify } from 'src/components/iconify';
import { PageHeader, PageContainer } from 'src/components/page-layout';

const BRAND_OPTIONS = [
  { value: 'Puravankara', label: 'Puravankara' },
  { value: 'Provident', label: 'Provident' },
];

export default function ProjectNewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { data: projects, loading: loadingProjects } = useProjects();
  const { data: zones } = useZones();
  const { data: cities } = useCities();
  const projectData = isEdit ? projects.find((p) => p.id === id) : undefined;

  const [initialized, setInitialized] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [brand, setBrand] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [cityId, setCityId] = useState('');
  const [phase, setPhase] = useState('');
  const status = 'active' as const;
  const [billingEntity, setBillingEntity] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [gstin, setGstin] = useState('');
  const [paymentGateway, setPaymentGateway] = useState('');
  const [incentiveCriteria, setIncentiveCriteria] = useState('');
  const [projectImage, setProjectImage] = useState('');
  const [jvImage, setJvImage] = useState('');

  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [nameError, setNameError] = useState('');
  const [codeError, setCodeError] = useState('');

  useEffect(() => {
    if (!initialized && (projects.length > 0 || !isEdit)) {
      if (isEdit && projectData) {
        setName(projectData.name);
        setCode(projectData.code);
        setBrand(projectData.brand);
        setZoneId(projectData.zoneId);
        setCityId(projectData.cityId);
        setPhase(projectData.phase);
        setBillingEntity(projectData.billingEntity ?? '');
        setBillingAddress(projectData.billingAddress ?? '');
        setGstin(projectData.gstin ?? '');
        setPaymentGateway(projectData.paymentGateway ?? '');
        setIncentiveCriteria(projectData.incentiveCriteria ?? '');
        setProjectImage(projectData.projectImage ?? '');
        setJvImage(projectData.jvImage ?? '');
      }
      setInitialized(true);
    }
  }, [initialized, projects, projectData, isEdit]);

  const cityOptions = useMemo(() => cities.map((c) => ({ value: c.id, label: c.name })), [cities]);

  const handleSave = useCallback(async () => {
    let valid = true;
    if (!name.trim()) { setNameError('Project name is required'); valid = false; } else { setNameError(''); }
    if (!code.trim()) { setCodeError('Project code is required'); valid = false; } else { setCodeError(''); }
    if (!zoneId) valid = false;
    if (!cityId) valid = false;
    if (!valid) return;

    setSaving(true);

    const cityMatch = cities.find((c) => c.id === cityId);
    const zoneMatch = zones.find((z) => z.id === zoneId);

    if (isApiMode()) {
      try {
        const { projectApi } = await import('src/services/api/project-api');
        const payload: any = {
          name: name.trim(),
          billingEntityName: billingEntity || undefined,
          billingGstin: gstin || undefined,
          isActive: true,
          extendedMetadata: {
            brand,
            zoneId,
            zoneName: zoneMatch?.name,
            cityId,
            cityName: cityMatch?.name,
            phase,
            billingAddress,
            paymentGateway,
            incentiveCriteria,
            projectImage,
            jvImage,
          },
        };
        if (isEdit && projectData) {
          await projectApi.update(projectData.id, payload);
        } else {
          await projectApi.create(payload);
        }
      } catch (e) { console.error(e); }
    } else {
      const { mockProjects } = await import('src/services/mock-data');
      if (isEdit && projectData) {
        Object.assign(projectData, {
          name: name.trim(), code: code.trim(), brand, zoneId, zoneName: zoneMatch?.name,
          cityId, cityName: cityMatch?.name, phase, status, billingEntity, billingAddress,
          gstin, paymentGateway, incentiveCriteria, projectImage, jvImage,
          updatedAt: new Date().toISOString(),
        });
      } else {
        mockProjects.unshift({
          id: String(Date.now()),
          name: name.trim(), code: code.trim(), brand, zoneId, zoneName: zoneMatch?.name,
          cityId, cityName: cityMatch?.name, phase, billingEntity, billingAddress,
          gstin, paymentGateway, incentiveCriteria, projectImage, jvImage,
          startDate: '', endDate: '', status,
          createdBy: 'You',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    setSaving(false);
    setShowSuccess(true);
    setTimeout(() => navigate(paths.dashboard.projectMaster), 1200);
  }, [name, code, brand, zoneId, cityId, phase, status, billingEntity, billingAddress, gstin, paymentGateway, incentiveCriteria, projectImage, jvImage, isEdit, projectData, zones, cities, navigate]);

  if (isEdit && !projectData) {
    return (
      <PageContainer>
        <PageHeader title="Project Not Found" description="The requested project does not exist" />
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">Project not found.</Typography>
          <Button onClick={() => navigate(paths.dashboard.projectMaster)} sx={{ mt: 2 }}>Back to Projects</Button>
        </Box>
      </PageContainer>
    );
  }

  return (
    <>
      <Helmet><title>{isEdit ? 'Edit Project' : 'Create Project'} - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader
          title={isEdit ? 'Edit Project' : 'Create Project'}
          description={isEdit ? 'Update project details across all sections' : 'Add a new project with zone, city, and configuration details'}
        />

        {saving && <LinearProgress />}

        {/* Section 1: Basic Details */}
        <Typography variant="subtitle1" sx={{ mb: 2.5, mt: 3 }}>1. Basic Details</Typography>
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5}>
          <TextField label="Project Name" value={name} onChange={(e) => { setName(e.target.value); setNameError(''); }} error={!!nameError} helperText={nameError} required fullWidth />
          <TextField label="Project Code" value={code} onChange={(e) => { setCode(e.target.value); setCodeError(''); }} error={!!codeError} helperText={codeError} required fullWidth />
          <TextField select label="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} required fullWidth>
            {BRAND_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          </TextField>
          <TextField select label="Zone" value={zoneId} onChange={(e) => { setZoneId(e.target.value); setCityId(''); }} required fullWidth>
            {zones.map((z) => <MenuItem key={z.id} value={z.id}>{z.name}</MenuItem>)}
          </TextField>
          <TextField select label="City" value={cityId} onChange={(e) => setCityId(e.target.value)} required fullWidth disabled={!zoneId}>
            {cityOptions.length === 0 && <MenuItem value="">{zoneId ? 'No cities available' : 'Select a zone first'}</MenuItem>}
            {cityOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          </TextField>
          <TextField label="Phase" value={phase} onChange={(e) => setPhase(e.target.value)} fullWidth />
        </Box>

        <Divider sx={{ borderStyle: 'dashed', my: 3 }} />

        {/* Section 2: Finance Details */}
        <Typography variant="subtitle1" sx={{ mb: 2.5 }}>2. Finance Details</Typography>
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5}>
          <TextField label="Billing Entity" value={billingEntity} onChange={(e) => setBillingEntity(e.target.value)} fullWidth />
          <TextField label="GSTIN" value={gstin} onChange={(e) => setGstin(e.target.value)} placeholder="e.g. 29AAACP1234H1Z5" helperText="15-character GSTIN format" fullWidth />
          <TextField label="Billing Address" value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} multiline rows={2} fullWidth sx={{ gridColumn: { sm: 'span 2' } }} />
        </Box>

        <Divider sx={{ borderStyle: 'dashed', my: 3 }} />

        {/* Section 3: Configuration */}
        <Typography variant="subtitle1" sx={{ mb: 2.5 }}>3. Configuration</Typography>
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5}>
          <TextField select label="Payment Gateway" value={paymentGateway} onChange={(e) => setPaymentGateway(e.target.value)} fullWidth>
            {['Razorpay', 'PhonePe', 'BillDesk', 'PayU', 'CCAvenue'].map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
          </TextField>
          <TextField select label="Incentive Criteria" value={incentiveCriteria} onChange={(e) => setIncentiveCriteria(e.target.value)} fullWidth>
            {['Standard', 'Custom', 'Sales target > 80%', 'Collection > 90%', 'Customer satisfaction > 4.5'].map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </TextField>
        </Box>

        <Divider sx={{ borderStyle: 'dashed', my: 3 }} />

        {/* Section 4: Assets */}
        <Typography variant="subtitle1" sx={{ mb: 2.5 }}>4. Assets</Typography>
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={3}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>Project Image</Typography>
            {projectImage ? (
              <Box sx={{ position: 'relative', width: 1, maxWidth: 280 }}>
                <Avatar src={projectImage} variant="rounded" sx={{ width: 1, height: 160 }} />
                <IconButton size="small" onClick={() => setProjectImage('')} sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}>
                  <Iconify icon="solar:close-circle-bold" width={18} />
                </IconButton>
              </Box>
            ) : (
              <Box sx={{ border: '2px dashed', borderColor: 'divider', borderRadius: 2, p: 3, textAlign: 'center', maxWidth: 280 }}>
                <TextField size="small" placeholder="Paste image URL..." value={projectImage} onChange={(e) => setProjectImage(e.target.value)} fullWidth sx={{ mb: 1 }} />
                <Typography variant="caption" color="text.disabled">Enter a URL or upload an image</Typography>
              </Box>
            )}
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>JV Image</Typography>
            {jvImage ? (
              <Box sx={{ position: 'relative', width: 1, maxWidth: 280 }}>
                <Avatar src={jvImage} variant="rounded" sx={{ width: 1, height: 160 }} />
                <IconButton size="small" onClick={() => setJvImage('')} sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}>
                  <Iconify icon="solar:close-circle-bold" width={18} />
                </IconButton>
              </Box>
            ) : (
              <Box sx={{ border: '2px dashed', borderColor: 'divider', borderRadius: 2, p: 3, textAlign: 'center', maxWidth: 280 }}>
                <TextField size="small" placeholder="Paste image URL..." value={jvImage} onChange={(e) => setJvImage(e.target.value)} fullWidth sx={{ mb: 1 }} />
                <Typography variant="caption" color="text.disabled">Enter a URL or upload an image</Typography>
              </Box>
            )}
          </Box>
        </Box>

        <Box sx={{ position: 'sticky', bottom: 0, zIndex: 10, bgcolor: 'background.default', borderTop: '1px solid', borderColor: 'divider', py: 2, px: 0, mt: 3 }}>
          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => navigate(paths.dashboard.projectMaster)} size="large">Cancel</Button>
            <Button variant="contained" startIcon={<Iconify icon="solar:check-circle-bold" />} onClick={handleSave} disabled={saving} size="large">
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </Stack>
        </Box>
      </PageContainer>

      <Snackbar open={showSuccess} autoHideDuration={2000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" sx={{ width: 1 }}>
          Project {isEdit ? 'updated' : 'created'} successfully
        </Alert>
      </Snackbar>
    </>
  );
}
