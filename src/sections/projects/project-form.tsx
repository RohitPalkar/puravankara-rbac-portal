import 'react-quill/dist/quill.snow.css';

import type { CreateProjectRequest, UpdateProjectRequest, IncentiveRuleRequest, PaymentGatewayRequest } from 'src/services/types/project';

import ReactQuill from 'react-quill';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import Snackbar from '@mui/material/Snackbar';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { queryKeys } from 'src/services/api/query-keys';
import { brandService } from 'src/services/services/brand.service';
import { phaseService } from 'src/services/services/phase.service';
import { cityService } from 'src/services/services/geography.service';
import { IncentiveType, PaymentGatewayType } from 'src/services/types/enums';
import { useProjectById, useCreateProject, useUpdateProject } from 'src/services/hooks/use-projects';

import { Iconify } from 'src/components/iconify';
import { PageHeader, PageContainer } from 'src/components/page-layout';

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'clean'],
  ],
};

export default function ProjectFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const projectId = id ? Number(id) : undefined;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jvFileInputRef = useRef<HTMLInputElement>(null);

  const { data: projectData, isLoading: isFetching, isError: isFetchError } = useProjectById(projectId ?? 0);
  const { mutateAsync: createProject, isPending: isCreating } = useCreateProject();
  const { mutateAsync: updateProject, isPending: isUpdating } = useUpdateProject();

  const [brandId, setBrandId] = useState<number | ''>('');
  const [cityId, setCityId] = useState<number | ''>('');
  const [name, setName] = useState('');
  const [billingName, setBillingName] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [gstin, setGstin] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [projectImage, setProjectImage] = useState('');
  const [jvLogo, setJvLogo] = useState('');
  const [sfdcProjectName, setSfdcProjectName] = useState('');
  const [codename, setCodename] = useState('');
  const [phaseId, setPhaseId] = useState<number | ''>('');
  const [nameError, setNameError] = useState('');
  const [brandIdError, setBrandIdError] = useState('');
  const [cityIdError, setCityIdError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Payment gateways
  const [razorpayEnabled, setRazorpayEnabled] = useState(false);
  const [razorpayMerchantId, setRazorpayMerchantId] = useState('');
  const [razorpaySecretKey, setRazorpaySecretKey] = useState('');
  const [easebuzzEnabled, setEasebuzzEnabled] = useState(false);
  const [easebuzzBookingSalt, setEasebuzzBookingSalt] = useState('');
  const [easebuzzMilestoneSalt, setEasebuzzMilestoneSalt] = useState('');
  const [easebuzzBookingKey, setEasebuzzBookingKey] = useState('');
  const [easebuzzMilestoneKey, setEasebuzzMilestoneKey] = useState('');
  const [easebuzzBookingSubMerchantId, setEasebuzzBookingSubMerchantId] = useState('');
  const [easebuzzMilestoneSubMerchantId, setEasebuzzMilestoneSubMerchantId] = useState('');
  const [agreementExecutionPercentage, setAgreementExecutionPercentage] = useState<number>(0);

  // Incentive criteria
  const [reraRegularizationPercentage, setReraRegularizationPercentage] = useState<number>(0);
  const [reraPayablePercentage, setReraPayablePercentage] = useState<number>(0);
  const [reraMaxDays, setReraMaxDays] = useState<number>(0);
  const [rtmRegularizationPercentage, setRtmRegularizationPercentage] = useState<number>(0);
  const [rtmPayablePercentage, setRtmPayablePercentage] = useState<number>(0);
  const [rtmStartDate, setRtmStartDate] = useState('');

  // Terms
  const [termsHtml, setTermsHtml] = useState('');

  const saving = isCreating || isUpdating;

  // Reference data
  const { data: allBrands } = useQuery({
    queryKey: queryKeys.brands.list({}),
    queryFn: async () => {
      const res = await brandService.list({});
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

  const { data: allPhases } = useQuery({
    queryKey: queryKeys.phases.list({}),
    queryFn: async () => {
      const res = await phaseService.list({});
      return res.data;
    },
  });

  // Populate form on edit
  useEffect(() => {
    if (!projectData) return;
    setBrandId(projectData.brandId);
    setCityId(projectData.cityId);
    setName(projectData.name);
    setBillingName(projectData.billingEntityName ?? '');
    setPanNumber(projectData.panNumber ?? '');
    setGstin(projectData.billingGstin ?? '');
    setAddress1(projectData.address1 ?? '');
    setAddress2(projectData.address2 ?? '');
    setPinCode(projectData.pinCode ?? '');
    setProjectImage(projectData.projectImagePath ?? '');
    setJvLogo(projectData.jvImagePath ?? '');
    setSfdcProjectName(projectData.sfdcProjectName ?? '');
    setCodename(projectData.codename ?? '');
    setPhaseId((projectData.extendedMetadata?.phaseId as number) ?? '');

    // Payment gateways
    const rp = projectData.paymentGateways?.find((g) => g.gatewayType === 'RAZORPAY');
    setRazorpayEnabled(!!rp);
    setRazorpayMerchantId(rp?.merchantId ?? '');
    setRazorpaySecretKey(rp?.secretKey ?? '');

    const eb = projectData.paymentGateways?.find((g) => g.gatewayType === 'EASEBUZZ_BOOKING');
    const ebMilestone = projectData.paymentGateways?.find((g) => g.gatewayType === 'EASEBUZZ_MILESTONE');
    setEasebuzzEnabled(!!eb || !!ebMilestone);
    setEasebuzzBookingSalt(eb?.salt ?? '');
    setEasebuzzBookingKey(eb?.key ?? '');
    setEasebuzzBookingSubMerchantId(eb?.subMerchantId ?? '');
    setEasebuzzMilestoneSalt(ebMilestone?.salt ?? '');
    setEasebuzzMilestoneKey(ebMilestone?.key ?? '');
    setEasebuzzMilestoneSubMerchantId(ebMilestone?.subMerchantId ?? '');

    // Incentive rules
    const rera = projectData.incentiveRules?.find((r) => r.incentiveType === IncentiveType.RERA);
    setReraRegularizationPercentage(rera?.regularizationPercentage ?? 0);
    setReraPayablePercentage(rera?.payablePercentage ?? 0);
    setReraMaxDays(rera?.maxDays ?? 0);

    const rtm = projectData.incentiveRules?.find((r) => r.incentiveType === IncentiveType.RTM);
    setRtmRegularizationPercentage(rtm?.regularizationPercentage ?? 0);
    setRtmPayablePercentage(rtm?.payablePercentage ?? 0);
    setRtmStartDate(rtm?.startDate ?? '');

    setTermsHtml(projectData.termsHtml ?? '');
  }, [projectData]);

  const filteredCities = useMemo(() => {
    if (!allCities || !brandId) return [];
    const brand = allBrands?.find((b) => b.id === brandId);
    if (!brand) return allCities;
    return allCities;
  }, [allCities, allBrands, brandId]);

  // Image upload handlers
  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setProjectImage(URL.createObjectURL(file));
  }, []);

  const handleJvUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setJvLogo(URL.createObjectURL(file));
  }, []);

  const handleViewImage = useCallback((url: string) => {
    if (url) window.open(url, '_blank');
  }, []);

  const handleRemoveImage = useCallback((setter: (v: string) => void) => {
    setter('');
  }, []);

  const validate = useCallback((): boolean => {
    let valid = true;
    if (!name.trim()) { setNameError('Project name is required'); valid = false; } else { setNameError(''); }
    if (!brandId) { setBrandIdError('Brand is required'); valid = false; } else { setBrandIdError(''); }
    if (!cityId) { setCityIdError('City is required'); valid = false; } else { setCityIdError(''); }
    return valid;
  }, [name, brandId, cityId]);

  const buildGateways = useCallback((): PaymentGatewayRequest[] => {
    const gateways: PaymentGatewayRequest[] = [];
    if (razorpayEnabled) {
      gateways.push({ gatewayType: PaymentGatewayType.RAZORPAY, merchantId: razorpayMerchantId || undefined, secretKey: razorpaySecretKey || undefined });
    }
    if (easebuzzEnabled) {
      gateways.push({ gatewayType: PaymentGatewayType.EASEBUZZ_BOOKING, salt: easebuzzBookingSalt || undefined, key: easebuzzBookingKey || undefined, subMerchantId: easebuzzBookingSubMerchantId || undefined });
      gateways.push({ gatewayType: PaymentGatewayType.EASEBUZZ_MILESTONE, salt: easebuzzMilestoneSalt || undefined, key: easebuzzMilestoneKey || undefined, subMerchantId: easebuzzMilestoneSubMerchantId || undefined });
    }
    return gateways;
  }, [razorpayEnabled, razorpayMerchantId, razorpaySecretKey, easebuzzEnabled, easebuzzBookingSalt, easebuzzBookingKey, easebuzzBookingSubMerchantId, easebuzzMilestoneSalt, easebuzzMilestoneKey, easebuzzMilestoneSubMerchantId]);

  const buildIncentives = useCallback((): IncentiveRuleRequest[] => {
    const rules: IncentiveRuleRequest[] = [];
    if (reraRegularizationPercentage || reraPayablePercentage || reraMaxDays) {
      rules.push({
        incentiveType: IncentiveType.RERA,
        regularizationPercentage: reraRegularizationPercentage || undefined,
        payablePercentage: reraPayablePercentage || undefined,
        maxDays: reraMaxDays || undefined,
      });
    }
    if (rtmRegularizationPercentage || rtmPayablePercentage || rtmStartDate) {
      rules.push({
        incentiveType: IncentiveType.RTM,
        regularizationPercentage: rtmRegularizationPercentage || undefined,
        payablePercentage: rtmPayablePercentage || undefined,
        startDate: rtmStartDate || undefined,
      });
    }
    return rules;
  }, [reraRegularizationPercentage, reraPayablePercentage, reraMaxDays, rtmRegularizationPercentage, rtmPayablePercentage, rtmStartDate]);

  const buildPayload = useCallback((): CreateProjectRequest => ({
    brandId: brandId as number,
    cityId: cityId as number,
    name: name.trim(),
    billingEntityName: billingName.trim() || undefined,
    panNumber: panNumber.trim().toUpperCase() || undefined,
    billingGstin: gstin.trim().toUpperCase() || undefined,
    address1: address1.trim() || undefined,
    address2: address2.trim() || undefined,
    pinCode: pinCode.trim() || undefined,
    projectImagePath: projectImage || undefined,
    jvImagePath: jvLogo || undefined,
    sfdcProjectName: sfdcProjectName.trim() || undefined,
    codename: codename.trim() || undefined,
    termsHtml: termsHtml || undefined,
    extendedMetadata: phaseId ? { phaseId } : undefined,
    paymentGateways: buildGateways(),
    incentiveRules: buildIncentives(),
    isActive: true,
  }), [brandId, cityId, name, billingName, panNumber, gstin, address1, address2, pinCode, projectImage, jvLogo, sfdcProjectName, codename, termsHtml, phaseId, buildGateways, buildIncentives]);

  const handleSave = useCallback(async () => {
    if (!validate()) return;

    try {
      if (isEdit && projectId) {
        await updateProject({ id: projectId, data: buildPayload() as UpdateProjectRequest });
      } else {
        await createProject(buildPayload());
      }
      setShowSuccess(true);
      setTimeout(() => navigate(paths.dashboard.projectMaster), 1200);
    } catch {
      // error handled by query cache invalidation
    }
  }, [validate, isEdit, projectId, buildPayload, createProject, updateProject, navigate]);

  if (isEdit && isFetching) {
    return (
      <PageContainer>
        <PageHeader title="Edit Project" />
        <Card sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Card>
      </PageContainer>
    );
  }

  if (isEdit && (isFetchError || (!isFetching && !projectData))) {
    return (
      <PageContainer>
        <PageHeader title="Project Not Found" description="The requested project does not exist" />
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">Project with ID &quot;{id}&quot; not found.</Typography>
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
          description={isEdit ? 'Update project details' : 'Add a new project'}
        />

        {saving && <LinearProgress />}

        <Card sx={{ p: 4 }}>
          {/* Project Details */}
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3 }}>Project Details</Typography>
          <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={3}>
            <TextField label="Brand" value={brandId} onChange={(e) => { setBrandId(Number(e.target.value) || ''); setCityId(''); }} select required error={!!brandIdError} helperText={brandIdError} fullWidth>
              {allBrands?.map((b) => <MenuItem key={b.id} value={b.id}>{b.brandName}</MenuItem>)}
            </TextField>
            <TextField label="City" value={cityId} onChange={(e) => setCityId(Number(e.target.value) || '')} select required error={!!cityIdError} helperText={cityIdError} fullWidth>
              {filteredCities?.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </TextField>
            <TextField label="Project Name" value={name} onChange={(e) => { setName(e.target.value); setNameError(''); }} error={!!nameError} helperText={nameError} required placeholder="Enter project name" fullWidth />
            <TextField label="Phase" value={phaseId} onChange={(e) => setPhaseId(Number(e.target.value) || '')} select fullWidth>
              <MenuItem value="">None</MenuItem>
              {allPhases?.map((p) => <MenuItem key={p.id} value={p.id}>{p.phaseName}</MenuItem>)}
            </TextField>
            <TextField label="Billing Name" value={billingName} onChange={(e) => setBillingName(e.target.value)} placeholder="Enter Name" fullWidth />
            <TextField label="PAN No." value={panNumber} onChange={(e) => setPanNumber(e.target.value.toUpperCase())} inputProps={{ maxLength: 10 }} placeholder="Enter PAN no." fullWidth />
            <TextField label="GSTIN" value={gstin} onChange={(e) => setGstin(e.target.value.toUpperCase())} inputProps={{ maxLength: 15 }} placeholder="Enter GSTIN" fullWidth />
            <TextField label="Address 1" value={address1} onChange={(e) => setAddress1(e.target.value)} placeholder="Enter Address" fullWidth />
            <TextField label="Address 2" value={address2} onChange={(e) => setAddress2(e.target.value)} placeholder="Enter Address" fullWidth />
            <TextField label="PIN Code" value={pinCode} onChange={(e) => setPinCode(e.target.value)} inputProps={{ maxLength: 6 }} placeholder="Enter PIN Code" fullWidth />
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Project Images */}
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3 }}>Project Images</Typography>
          <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={3}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>Project Image</Typography>
              <Box
                sx={{
                  border: '2px dashed', borderColor: projectImage ? 'primary.main' : 'divider',
                  borderRadius: 2, p: 2.5, textAlign: 'center', bgcolor: projectImage ? 'primary.lighter' : 'grey.50',
                  cursor: 'pointer', transition: 'all 0.2s',
                  '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.lighter' },
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleLogoUpload} />
                {projectImage ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    <Avatar src={projectImage} sx={{ width: 40, height: 40, borderRadius: 1 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {projectImage.split('/').pop() || 'image.png'}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">Upload Project Image</Typography>
                )}
              </Box>
              <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>JPEG, PNG, JPG, SVG (Max 10 MB)</Typography>
              {projectImage && (
                <Stack direction="row" spacing={1} sx={{ mt: 1, justifyContent: 'flex-end' }}>
                  <Button size="small" variant="outlined" color="error" startIcon={<Iconify icon="solar:trash-bin-trash-bold" width={16} />} onClick={() => handleRemoveImage(setProjectImage)}>Delete</Button>
                  <Button size="small" variant="outlined" startIcon={<Iconify icon="solar:eye-bold" width={16} />} onClick={() => handleViewImage(projectImage)}>View</Button>
                </Stack>
              )}
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>JV Partner Logo</Typography>
              <Box
                sx={{
                  border: '2px dashed', borderColor: jvLogo ? 'primary.main' : 'divider',
                  borderRadius: 2, p: 2.5, textAlign: 'center', bgcolor: jvLogo ? 'primary.lighter' : 'grey.50',
                  cursor: 'pointer', transition: 'all 0.2s',
                  '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.lighter' },
                }}
                onClick={() => jvFileInputRef.current?.click()}
              >
                <input ref={jvFileInputRef} type="file" accept="image/*" hidden onChange={handleJvUpload} />
                {jvLogo ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    <Avatar src={jvLogo} sx={{ width: 40, height: 40, borderRadius: 1 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {jvLogo.split('/').pop() || 'logo.png'}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">Upload JV Partner Logo</Typography>
                )}
              </Box>
              <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>JPEG, PNG, JPG, SVG (Max 10 MB)</Typography>
              {jvLogo && (
                <Stack direction="row" spacing={1} sx={{ mt: 1, justifyContent: 'flex-end' }}>
                  <Button size="small" variant="outlined" color="error" startIcon={<Iconify icon="solar:trash-bin-trash-bold" width={16} />} onClick={() => handleRemoveImage(setJvLogo)}>Delete</Button>
                  <Button size="small" variant="outlined" startIcon={<Iconify icon="solar:eye-bold" width={16} />} onClick={() => handleViewImage(jvLogo)}>View</Button>
                </Stack>
              )}
            </Box>
            <TextField label="SFDC Project Name" value={sfdcProjectName} onChange={(e) => setSfdcProjectName(e.target.value)} placeholder="Enter SFDC project name" fullWidth />
            <TextField label="Codename" value={codename} onChange={(e) => setCodename(e.target.value)} placeholder="Enter project codename" fullWidth />
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Payment Gateway */}
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Payment Gateway</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Select Payment Gateway</Typography>
          <Stack direction="row" spacing={4} sx={{ mb: 3 }}>
            <FormControlLabel control={<Checkbox checked={easebuzzEnabled} onChange={(e) => setEasebuzzEnabled(e.target.checked)} />} label="Easebuzz" />
            <FormControlLabel control={<Checkbox checked={razorpayEnabled} onChange={(e) => setRazorpayEnabled(e.target.checked)} />} label="Razorpay" />
          </Stack>

          {razorpayEnabled && (
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={3} sx={{ mb: 3 }}>
              <TextField label="RazorPay Merchant ID for booking" value={razorpayMerchantId} onChange={(e) => setRazorpayMerchantId(e.target.value)} placeholder="Enter RazorPay Merchant ID" fullWidth />
              <TextField label="RazorPay Secret Key" value={razorpaySecretKey} onChange={(e) => setRazorpaySecretKey(e.target.value)} type="password" placeholder="Enter RazorPay Secret Key" fullWidth />
            </Box>
          )}

          {easebuzzEnabled && (
            <>
              <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={3} sx={{ mb: 3 }}>
                <TextField label="Easebuzz Salt" value={easebuzzBookingSalt} onChange={(e) => setEasebuzzBookingSalt(e.target.value)} placeholder="Enter Easebuzz Booking Salt" fullWidth />
                <TextField label="Easebuzz Salt (Milestone)" value={easebuzzMilestoneSalt} onChange={(e) => setEasebuzzMilestoneSalt(e.target.value)} placeholder="Enter Easebuzz Milestone Salt" fullWidth />
              </Box>
              <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={3} sx={{ mb: 3 }}>
                <TextField label="Easebuzz Key (Booking)" value={easebuzzBookingKey} onChange={(e) => setEasebuzzBookingKey(e.target.value)} placeholder="Enter Easebuzz Booking Key" fullWidth />
                <TextField label="Easebuzz Key (Milestone)" value={easebuzzMilestoneKey} onChange={(e) => setEasebuzzMilestoneKey(e.target.value)} placeholder="Enter Easebuzz Milestone Key" fullWidth />
              </Box>
              <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={3} sx={{ mb: 3 }}>
                <TextField label="Easebuzz sub-merchant ID (Booking)" value={easebuzzBookingSubMerchantId} onChange={(e) => setEasebuzzBookingSubMerchantId(e.target.value)} placeholder="Enter Easebuzz sub-merchant ID" fullWidth />
                <TextField label="Easebuzz sub-merchant ID (Milestone)" value={easebuzzMilestoneSubMerchantId} onChange={(e) => setEasebuzzMilestoneSubMerchantId(e.target.value)} placeholder="Enter Easebuzz sub-merchant ID" fullWidth />
              </Box>
            </>
          )}

          <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={3}>
            <TextField label="Agreement execution at X% of the AV" value={agreementExecutionPercentage} onChange={(e) => setAgreementExecutionPercentage(Number(e.target.value))} type="number" inputProps={{ min: 0, max: 100 }} placeholder="Enter Agreement execution at X% of the AV" fullWidth />
            <Box /> {/* empty cell to maintain grid alignment */}
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Incentive Criteria */}
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3 }}>Incentive Criteria</Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 2.5, color: 'text.secondary' }}>RERA / Under Construction</Typography>
              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2.5} sx={{ mb: 2.5 }}>
                <TextField label="Regularization" value={reraRegularizationPercentage} onChange={(e) => setReraRegularizationPercentage(Number(e.target.value))} type="number" inputProps={{ min: 0, max: 100 }} placeholder="0.0" />
                <TextField label="Payable" value={reraPayablePercentage} onChange={(e) => setReraPayablePercentage(Number(e.target.value))} type="number" inputProps={{ min: 0, max: 100 }} placeholder="0.0" />
              </Box>
              <TextField label="Maximum Regularization Days" value={reraMaxDays} onChange={(e) => setReraMaxDays(Number(e.target.value))} type="number" inputProps={{ min: 0 }} placeholder="Enter days" fullWidth />
            </Box>
            <Box sx={{ width: '1px', bgcolor: 'divider', flexShrink: 0 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 2.5, color: 'text.secondary' }}>RTM / OC Received</Typography>
              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2.5} sx={{ mb: 2.5 }}>
                <TextField label="Regularization" value={rtmRegularizationPercentage} onChange={(e) => setRtmRegularizationPercentage(Number(e.target.value))} type="number" inputProps={{ min: 0, max: 100 }} placeholder="0.0" />
                <TextField label="Payable" value={rtmPayablePercentage} onChange={(e) => setRtmPayablePercentage(Number(e.target.value))} type="number" inputProps={{ min: 0, max: 100 }} placeholder="0.0" />
              </Box>
              <TextField label="Regularization Start Date" value={rtmStartDate} onChange={(e) => setRtmStartDate(e.target.value)} type="date" InputLabelProps={{ shrink: true }} placeholder="Select regularization start date" fullWidth />
            </Box>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Terms & Conditions */}
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3 }}>Terms &amp; Conditions</Typography>
          <Box sx={{ '& .ql-editor': { minHeight: 180 } }}>
            <ReactQuill value={termsHtml} onChange={setTermsHtml} modules={quillModules} placeholder="Enter terms and conditions..." />
          </Box>
        </Card>

        <Box sx={{ position: 'sticky', bottom: 0, zIndex: 10, bgcolor: 'background.default', borderTop: '1px solid', borderColor: 'divider', py: 2, px: 0, mt: 3 }}>
          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => navigate(paths.dashboard.projectMaster)} size="large">
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
          Project {isEdit ? 'updated' : 'created'} successfully
        </Alert>
      </Snackbar>
    </>
  );
}
