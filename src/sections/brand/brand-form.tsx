import 'react-quill/dist/quill.snow.css';

import type { CreateBrandRequest, UpdateBrandRequest } from 'src/services/types/brand';

import ReactQuill from 'react-quill';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { useMyPermissions } from 'src/services/hooks/use-permissions';
import {
  useBrandById,
  useCreateBrand,
  useUpdateBrand,
} from 'src/services/hooks/use-brands';

import { Iconify } from 'src/components/iconify';
import { PageHeader, PageContainer } from 'src/components/page-layout';

function hasBrandPermission(
  permissions: { projects: { modules: { subModules: { name: string; actions: { code: string; allowed: boolean }[] }[] }[] }[] } | undefined,
  action: string
): boolean {
  if (!permissions) return false;
  return permissions.projects.some((project) =>
    project.modules.some((mod) =>
      mod.subModules.some((sub) =>
        sub.name === 'BRANDS' && sub.actions.some((a) => a.code === action && a.allowed)
      )
    )
  );
}

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'clean'],
  ],
};

export default function BrandFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const brandId = id ? Number(id) : undefined;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: permissions } = useMyPermissions();
  const canCreate = useMemo(() => hasBrandPermission(permissions, 'CREATE'), [permissions]);
  const canEdit = useMemo(() => hasBrandPermission(permissions, 'EDIT'), [permissions]);

  const { data: brandData, isLoading: isFetching, isError: isFetchError } = useBrandById(brandId ?? 0);
  const { mutateAsync: createBrand, isPending: isCreating } = useCreateBrand();
  const { mutateAsync: updateBrand, isPending: isUpdating } = useUpdateBrand();

  const [brandName, setBrandName] = useState('');
  const [salaryMultiplier, setSalaryMultiplier] = useState(1);
  const [razorpayMerchantId, setRazorpayMerchantId] = useState('');
  const [razorpaySecretKey, setRazorpaySecretKey] = useState('');
  const [easebuzzBookingSalt, setEasebuzzBookingSalt] = useState('');
  const [easebuzzBookingKey, setEasebuzzBookingKey] = useState('');
  const [easebuzzBookingSubMerchantId, setEasebuzzBookingSubMerchantId] = useState('');
  const [easebuzzMilestoneSalt, setEasebuzzMilestoneSalt] = useState('');
  const [easebuzzMilestoneKey, setEasebuzzMilestoneKey] = useState('');
  const [easebuzzMilestoneSubMerchantId, setEasebuzzMilestoneSubMerchantId] = useState('');
  const [billingName, setBillingName] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [gstin, setGstin] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [reraRegularizationPercentage, setReraRegularizationPercentage] = useState(5);
  const [reraQualificationPercentage, setReraQualificationPercentage] = useState(80);
  const [maximumRegularizationDays, setMaximumRegularizationDays] = useState(30);
  const [rtmRegularizationPercentage, setRtmRegularizationPercentage] = useState(3);
  const [rtmQualificationPercentage, setRtmQualificationPercentage] = useState(90);
  const [regularizationStartDate, setRegularizationStartDate] = useState('');
  const [termsAndConditions, setTermsAndConditions] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [brandNameError, setBrandNameError] = useState('');

  const saving = isCreating || isUpdating;

  useEffect(() => {
    if (brandData) {
      setBrandName(brandData.brandName);
      setSalaryMultiplier(brandData.salaryMultiplier);
      setRazorpayMerchantId(brandData.razorpayMerchantId ?? '');
      setRazorpaySecretKey(brandData.razorpaySecretKey ?? '');
      setEasebuzzBookingSalt(brandData.easebuzzBookingSalt ?? '');
      setEasebuzzBookingKey(brandData.easebuzzBookingKey ?? '');
      setEasebuzzBookingSubMerchantId(brandData.easebuzzBookingSubMerchantId ?? '');
      setEasebuzzMilestoneSalt(brandData.easebuzzMilestoneSalt ?? '');
      setEasebuzzMilestoneKey(brandData.easebuzzMilestoneKey ?? '');
      setEasebuzzMilestoneSubMerchantId(brandData.easebuzzMilestoneSubMerchantId ?? '');
      setBillingName(brandData.billingName ?? '');
      setPanNumber(brandData.panNumber ?? '');
      setGstin(brandData.gstin ?? '');
      setAddress1(brandData.address1 ?? '');
      setAddress2(brandData.address2 ?? '');
      setPinCode(brandData.pinCode ?? '');
      setLogoUrl(brandData.logoUrl ?? '');
      setReraRegularizationPercentage(brandData.reraRegularizationPercentage ?? 5);
      setReraQualificationPercentage(brandData.reraQualificationPercentage ?? 80);
      setMaximumRegularizationDays(brandData.maximumRegularizationDays ?? 30);
      setRtmRegularizationPercentage(brandData.rtmRegularizationPercentage ?? 3);
      setRtmQualificationPercentage(brandData.rtmQualificationPercentage ?? 90);
      setRegularizationStartDate(brandData.regularizationStartDate ?? '');
      setTermsAndConditions(brandData.termsAndConditions ?? '');
    }
  }, [brandData]);

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoUrl(URL.createObjectURL(file));
    }
  }, []);

  const buildPayload = useCallback((): CreateBrandRequest => ({
    brandName: brandName.trim(),
    salaryMultiplier,
    razorpayMerchantId: razorpayMerchantId.trim() || undefined,
    razorpaySecretKey: razorpaySecretKey.trim() || undefined,
    easebuzzBookingSalt: easebuzzBookingSalt.trim() || undefined,
    easebuzzBookingKey: easebuzzBookingKey.trim() || undefined,
    easebuzzBookingSubMerchantId: easebuzzBookingSubMerchantId.trim() || undefined,
    easebuzzMilestoneSalt: easebuzzMilestoneSalt.trim() || undefined,
    easebuzzMilestoneKey: easebuzzMilestoneKey.trim() || undefined,
    easebuzzMilestoneSubMerchantId: easebuzzMilestoneSubMerchantId.trim() || undefined,
    billingName: billingName.trim() || undefined,
    panNumber: panNumber.trim() || undefined,
    gstin: gstin.trim() || undefined,
    address1: address1.trim() || undefined,
    address2: address2.trim() || undefined,
    pinCode: pinCode.trim() || undefined,
    logoUrl: logoUrl || undefined,
    reraRegularizationPercentage: reraRegularizationPercentage || undefined,
    reraQualificationPercentage: reraQualificationPercentage || undefined,
    maximumRegularizationDays: maximumRegularizationDays || undefined,
    rtmRegularizationPercentage: rtmRegularizationPercentage || undefined,
    rtmQualificationPercentage: rtmQualificationPercentage || undefined,
    regularizationStartDate: regularizationStartDate || undefined,
    termsAndConditions: termsAndConditions || undefined,
    isActive: true,
  }), [brandName, salaryMultiplier, razorpayMerchantId, razorpaySecretKey,
    easebuzzBookingSalt, easebuzzBookingKey, easebuzzBookingSubMerchantId,
    easebuzzMilestoneSalt, easebuzzMilestoneKey, easebuzzMilestoneSubMerchantId,
    billingName, panNumber, gstin, address1, address2, pinCode, logoUrl,
    reraRegularizationPercentage, reraQualificationPercentage, maximumRegularizationDays,
    rtmRegularizationPercentage, rtmQualificationPercentage, regularizationStartDate, termsAndConditions]);

  const handleSave = useCallback(async () => {
    if (!brandName.trim()) {
      setBrandNameError('Brand name is required');
      return;
    }
    setBrandNameError('');

    try {
      if (isEdit && brandId) {
        const payload = buildPayload();
        await updateBrand({ id: brandId, data: payload as UpdateBrandRequest });
      } else {
        await createBrand(buildPayload() as CreateBrandRequest);
      }
      setShowSuccess(true);
      setTimeout(() => navigate(paths.dashboard.brandMaster), 1200);
    } catch {
      // error handled by query cache invalidation
    }
  }, [brandName, isEdit, brandId, buildPayload, createBrand, updateBrand, navigate]);

  if (isEdit && isFetching) {
    return (
      <PageContainer>
        <PageHeader title="Edit Brand" />
        <Card sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Card>
      </PageContainer>
    );
  }

  if (isEdit && (isFetchError || (!isFetching && !brandData))) {
    return (
      <PageContainer>
        <PageHeader title="Brand Not Found" description="The requested brand does not exist" />
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">Brand with ID &quot;{id}&quot; not found.</Typography>
          <Button onClick={() => navigate(paths.dashboard.brandMaster)} sx={{ mt: 2 }}>Back to Brands</Button>
        </Card>
      </PageContainer>
    );
  }

  if (isEdit && !canEdit) {
    return (
      <PageContainer>
        <PageHeader title="Access Denied" />
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="error">You do not have permission to edit brands.</Typography>
          <Button onClick={() => navigate(paths.dashboard.brandMaster)} sx={{ mt: 2 }}>Back to Brands</Button>
        </Card>
      </PageContainer>
    );
  }

  if (!isEdit && !canCreate) {
    return (
      <PageContainer>
        <PageHeader title="Access Denied" />
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="error">You do not have permission to create brands.</Typography>
          <Button onClick={() => navigate(paths.dashboard.brandMaster)} sx={{ mt: 2 }}>Back to Brands</Button>
        </Card>
      </PageContainer>
    );
  }

  return (
    <>
      <Helmet><title>{isEdit ? 'Edit Brand' : 'Create Brand'} - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader
          title={isEdit ? 'Edit Brand' : 'Create Brand'}
          description={isEdit ? 'Update brand details' : 'Add a new brand entity'}
        />

        {saving && <LinearProgress />}

        <Stack spacing={3}>
          {/* 1. Brand Information */}
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2.5 }}>Brand Information</Typography>
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5}>
              <TextField
                label="Brand Name"
                value={brandName}
                onChange={(e) => { setBrandName(e.target.value); setBrandNameError(''); }}
                error={!!brandNameError}
                helperText={brandNameError}
                required
              />
              <TextField
                label="Salary Multiplier"
                value={salaryMultiplier}
                onChange={(e) => setSalaryMultiplier(Number(e.target.value))}
                type="number"
                inputProps={{ step: 0.1, min: 0 }}
              />
            </Box>
          </Card>

          {/* 2. Razorpay */}
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2.5 }}>Razorpay</Typography>
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5}>
              <TextField label="Merchant ID" value={razorpayMerchantId} onChange={(e) => setRazorpayMerchantId(e.target.value)} />
              <TextField label="Secret Key" value={razorpaySecretKey} onChange={(e) => setRazorpaySecretKey(e.target.value)} type="password" />
            </Box>
          </Card>

          {/* 3. Easebuzz */}
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2.5 }}>Easebuzz</Typography>
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5}>
              <Typography variant="subtitle2" sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>Booking</Typography>
              <TextField label="Salt" value={easebuzzBookingSalt} onChange={(e) => setEasebuzzBookingSalt(e.target.value)} />
              <TextField label="Key" value={easebuzzBookingKey} onChange={(e) => setEasebuzzBookingKey(e.target.value)} />
              <TextField label="Sub Merchant ID" value={easebuzzBookingSubMerchantId} onChange={(e) => setEasebuzzBookingSubMerchantId(e.target.value)} />
              <Typography variant="subtitle2" sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>Milestone</Typography>
              <TextField label="Salt" value={easebuzzMilestoneSalt} onChange={(e) => setEasebuzzMilestoneSalt(e.target.value)} />
              <TextField label="Key" value={easebuzzMilestoneKey} onChange={(e) => setEasebuzzMilestoneKey(e.target.value)} />
              <TextField label="Sub Merchant ID" value={easebuzzMilestoneSubMerchantId} onChange={(e) => setEasebuzzMilestoneSubMerchantId(e.target.value)} />
            </Box>
          </Card>

          {/* 4. Business Information */}
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2.5 }}>Business Information</Typography>
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5}>
              <TextField label="Billing Name" value={billingName} onChange={(e) => setBillingName(e.target.value)} />
              <TextField label="PAN Number" value={panNumber} onChange={(e) => setPanNumber(e.target.value.toUpperCase())} inputProps={{ maxLength: 10 }} />
              <TextField label="GSTIN" value={gstin} onChange={(e) => setGstin(e.target.value.toUpperCase())} inputProps={{ maxLength: 15 }} />
              <TextField label="Address Line 1" value={address1} onChange={(e) => setAddress1(e.target.value)} sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }} />
              <TextField label="Address Line 2" value={address2} onChange={(e) => setAddress2(e.target.value)} sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }} />
              <TextField label="PIN Code" value={pinCode} onChange={(e) => setPinCode(e.target.value)} inputProps={{ maxLength: 6 }} />
            </Box>
          </Card>

          {/* 5. Brand Logo */}
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2.5 }}>Brand Logo</Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar src={logoUrl || undefined} sx={{ width: 64, height: 64, bgcolor: 'grey.300' }}>
                <Iconify icon="solar:gallery-bold" width={28} />
              </Avatar>
              <Button variant="outlined" component="span" onClick={() => fileInputRef.current?.click()}>
                {logoUrl ? 'Replace' : 'Upload Logo'}
              </Button>
              <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleLogoUpload} />
              {logoUrl && (
                <Button size="small" color="error" onClick={() => setLogoUrl('')}>Remove</Button>
              )}
            </Box>
          </Card>

          {/* 6. Incentive Criteria */}
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2.5 }}>Incentive Criteria</Typography>
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={3}>
              <Card variant="outlined" sx={{ p: 2.5 }}>
                <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>RERA</Typography>
                <Stack spacing={2.5}>
                  <TextField
                    label="Regularization %"
                    value={reraRegularizationPercentage}
                    onChange={(e) => setReraRegularizationPercentage(Number(e.target.value))}
                    type="number"
                    inputProps={{ min: 0, max: 100 }}
                  />
                  <TextField
                    label="Qualification %"
                    value={reraQualificationPercentage}
                    onChange={(e) => setReraQualificationPercentage(Number(e.target.value))}
                    type="number"
                    inputProps={{ min: 0, max: 100 }}
                  />
                  <TextField
                    label="Maximum Regularization Days"
                    value={maximumRegularizationDays}
                    onChange={(e) => setMaximumRegularizationDays(Number(e.target.value))}
                    type="number"
                    inputProps={{ min: 0 }}
                  />
                </Stack>
              </Card>
              <Card variant="outlined" sx={{ p: 2.5 }}>
                <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>RTM</Typography>
                <Stack spacing={2.5}>
                  <TextField
                    label="Regularization %"
                    value={rtmRegularizationPercentage}
                    onChange={(e) => setRtmRegularizationPercentage(Number(e.target.value))}
                    type="number"
                    inputProps={{ min: 0, max: 100 }}
                  />
                  <TextField
                    label="Qualification %"
                    value={rtmQualificationPercentage}
                    onChange={(e) => setRtmQualificationPercentage(Number(e.target.value))}
                    type="number"
                    inputProps={{ min: 0, max: 100 }}
                  />
                  <TextField
                    label="Regularization Start Date"
                    value={regularizationStartDate}
                    onChange={(e) => setRegularizationStartDate(e.target.value)}
                    type="date"
                    InputLabelProps={{ shrink: true }}
                  />
                </Stack>
              </Card>
            </Box>
          </Card>

          {/* 7. Terms & Conditions */}
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2.5 }}>Terms &amp; Conditions</Typography>
            <Box sx={{ '& .ql-editor': { minHeight: 180 } }}>
              <ReactQuill
                value={termsAndConditions}
                onChange={setTermsAndConditions}
                modules={quillModules}
                placeholder="Enter terms and conditions..."
              />
            </Box>
          </Card>
        </Stack>

        <Box sx={{ position: 'sticky', bottom: 0, zIndex: 10, bgcolor: 'background.default', borderTop: '1px solid', borderColor: 'divider', py: 2, px: 0, mt: 3 }}>
          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => navigate(paths.dashboard.brandMaster)} size="large">
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
          Brand {isEdit ? 'updated' : 'created'} successfully
        </Alert>
      </Snackbar>
    </>
  );
}
