import { useState, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import { CONFIG } from 'src/config-global';
import { PageContainer, PageHeader } from 'src/components/page-layout';
import { Iconify } from 'src/components/iconify';
import { mockZones, mockCities, mockProjects } from 'src/services/mock-data';
import { paths } from 'src/routes/paths';
import type { Project } from 'src/types';

const BRAND_OPTIONS = [
  { value: 'Puravankara', label: 'Puravankara' },
  { value: 'Provident', label: 'Provident' },
];

const ZONE_OPTIONS = mockZones.map((z) => ({ value: z.id, label: z.name }));

export default function ProjectNewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [projectData] = useState<Project | undefined>(
    isEdit ? mockProjects.find((p) => p.id === id) : undefined
  );

  const [name, setName] = useState(projectData?.name ?? '');
  const [code, setCode] = useState(projectData?.code ?? '');
  const [brand, setBrand] = useState(projectData?.brand ?? '');
  const [zoneId, setZoneId] = useState(projectData?.zoneId ?? '');
  const [cityId, setCityId] = useState(projectData?.cityId ?? '');
  const [phase, setPhase] = useState(projectData?.phase ?? '');
  const status = 'active' as const;
  const [billingEntity, setBillingEntity] = useState(projectData?.billingEntity ?? '');
  const [billingAddress, setBillingAddress] = useState(projectData?.billingAddress ?? '');
  const [gstin, setGstin] = useState(projectData?.gstin ?? '');
  const [paymentGateway, setPaymentGateway] = useState(projectData?.paymentGateway ?? '');
  const [incentiveCriteria, setIncentiveCriteria] = useState(projectData?.incentiveCriteria ?? '');
  const [projectImage, setProjectImage] = useState(projectData?.projectImage ?? '');
  const [jvImage, setJvImage] = useState(projectData?.jvImage ?? '');

  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [nameError, setNameError] = useState('');
  const [codeError, setCodeError] = useState('');

  const cityOptions = useMemo(() => {
    if (!zoneId) return [];
    return mockCities
      .filter((c) => c.zoneId === zoneId)
      .map((c) => ({ value: c.id, label: c.name }));
  }, [zoneId]);

  const handleSave = useCallback(() => {
    let valid = true;
    if (!name.trim()) { setNameError('Project name is required'); valid = false; } else { setNameError(''); }
    if (!code.trim()) { setCodeError('Project code is required'); valid = false; } else { setCodeError(''); }
    if (!zoneId) valid = false;
    if (!cityId) valid = false;
    if (!valid) return;

    setSaving(true);

    const zone = mockZones.find((z) => z.id === zoneId);
    const city = mockCities.find((c) => c.id === cityId);

    setTimeout(() => {
      if (isEdit && projectData) {
        Object.assign(projectData, {
          name: name.trim(), code: code.trim(), brand, zoneId, zoneName: zone?.name,
          cityId, cityName: city?.name, phase, status, billingEntity, billingAddress,
          gstin, paymentGateway, incentiveCriteria, projectImage, jvImage,
          updatedAt: new Date().toISOString(),
        });
      } else {
        mockProjects.unshift({
          id: String(Date.now()),
          name: name.trim(), code: code.trim(), brand, zoneId, zoneName: zone?.name,
          cityId, cityName: city?.name, phase, billingEntity, billingAddress,
          gstin, paymentGateway, incentiveCriteria, projectImage, jvImage,
          startDate: '', endDate: '', status,
          createdBy: 'You',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      setSaving(false);
      setShowSuccess(true);
      setTimeout(() => navigate(paths.dashboard.projectMaster), 1200);
    }, 800);
  }, [name, code, brand, zoneId, cityId, phase, status, billingEntity, billingAddress, gstin, paymentGateway, incentiveCriteria, projectImage, jvImage, isEdit, projectData, navigate]);

  if (isEdit && !projectData) {
    return (
      <PageContainer>
        <PageHeader title="Project Not Found" description="The requested project does not exist" />
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">Project not found.</Typography>
          <Button onClick={() => navigate(paths.dashboard.projectMaster)} sx={{ mt: 2 }}>Back to Projects</Button>
        </Card>
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
        <Card sx={{ p: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2.5 }}>1. Basic Details</Typography>
          <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5}>
            <TextField label="Project Name" value={name} onChange={(e) => { setName(e.target.value); setNameError(''); }} error={!!nameError} helperText={nameError} required fullWidth />
            <TextField label="Project Code" value={code} onChange={(e) => { setCode(e.target.value); setCodeError(''); }} error={!!codeError} helperText={codeError} required fullWidth />
            <TextField select label="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} required fullWidth>
              {BRAND_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
            </TextField>
            <TextField select label="Zone" value={zoneId} onChange={(e) => { setZoneId(e.target.value); setCityId(''); }} required fullWidth>
              {ZONE_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
            </TextField>
            <TextField select label="City" value={cityId} onChange={(e) => setCityId(e.target.value)} required fullWidth disabled={!zoneId}>
              {cityOptions.length === 0 && <MenuItem value="">{zoneId ? 'No cities available' : 'Select a zone first'}</MenuItem>}
              {cityOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
            </TextField>
            <TextField label="Phase" value={phase} onChange={(e) => setPhase(e.target.value)} fullWidth />
            
          </Box>
        </Card>

        {/* Section 2: Finance Details */}
        <Card sx={{ p: 3, mt: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2.5 }}>2. Finance Details</Typography>
          <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5}>
            <TextField label="Billing Entity" value={billingEntity} onChange={(e) => setBillingEntity(e.target.value)} fullWidth />
            <TextField label="GSTIN" value={gstin} onChange={(e) => setGstin(e.target.value)} placeholder="e.g. 29AAACP1234H1Z5" helperText="15-character GSTIN format" fullWidth />
            <TextField label="Billing Address" value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} multiline rows={2} fullWidth sx={{ gridColumn: { sm: 'span 2' } }} />
          </Box>
        </Card>

        {/* Section 3: Configuration */}
        <Card sx={{ p: 3, mt: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2.5 }}>3. Configuration</Typography>
          <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5}>
            <TextField select label="Payment Gateway" value={paymentGateway} onChange={(e) => setPaymentGateway(e.target.value)} fullWidth>
              {['Razorpay', 'PhonePe', 'BillDesk', 'PayU', 'CCAvenue'].map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
            </TextField>
            <TextField select label="Incentive Criteria" value={incentiveCriteria} onChange={(e) => setIncentiveCriteria(e.target.value)} fullWidth>
              {['Standard', 'Custom', 'Sales target > 80%', 'Collection > 90%', 'Customer satisfaction > 4.5'].map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField>
          </Box>
        </Card>

        {/* Section 4: Assets */}
        <Card sx={{ p: 3, mt: 3 }}>
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
        </Card>

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
