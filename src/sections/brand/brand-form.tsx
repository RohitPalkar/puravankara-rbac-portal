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
import Divider from '@mui/material/Divider';
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

  const handleViewLogo = useCallback(() => {
    if (logoUrl) window.open(logoUrl, '_blank');
  }, [logoUrl]);

  const handleRemoveLogo = useCallback(() => {
    setLogoUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
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

        <Card sx={{ p: 4 }}>
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={3}>
            <TextField
              label="Brand Name"
              value={brandName}
              onChange={(e) => { setBrandName(e.target.value); setBrandNameError(''); }}
              error={!!brandNameError}
              helperText={brandNameError}
              required
              placeholder="Enter Brand Name"
            />
            <TextField
              label="Salary Multiplier"
              value={salaryMultiplier}
              onChange={(e) => setSalaryMultiplier(Number(e.target.value))}
              type="number"
              inputProps={{ step: 0.1, min: 0 }}
              placeholder="e.g. 1.5"
            />
          </Box>

          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={3} sx={{ mt: 3 }}>
            <TextField label="RazorPay Merchant ID (Booking)" value={razorpayMerchantId} onChange={(e) => setRazorpayMerchantId(e.target.value)} placeholder="Enter RazorPay Merchant ID" />
            <TextField label="RazorPay Secret Key (Booking)" value={razorpaySecretKey} onChange={(e) => setRazorpaySecretKey(e.target.value)} type="password" placeholder="Enter RazorPay Secret Key" />
          </Box>

          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={3} sx={{ mt: 3 }}>
            <TextField label="Easebuzz Salt (Booking)" value={easebuzzBookingSalt} onChange={(e) => setEasebuzzBookingSalt(e.target.value)} placeholder="Enter Easebuzz Booking Salt" />
            <TextField label="Easebuzz Key (Booking)" value={easebuzzBookingKey} onChange={(e) => setEasebuzzBookingKey(e.target.value)} placeholder="Enter Easebuzz Booking Key" />
          </Box>

          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={3} sx={{ mt: 3 }}>
            <TextField label="Easebuzz Salt (Milestone)" value={easebuzzMilestoneSalt} onChange={(e) => setEasebuzzMilestoneSalt(e.target.value)} placeholder="Enter Easebuzz Milestone Salt" />
            <TextField label="Easebuzz Key (Milestone)" value={easebuzzMilestoneKey} onChange={(e) => setEasebuzzMilestoneKey(e.target.value)} placeholder="Enter Easebuzz Milestone Key" />
          </Box>

          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={3} sx={{ mt: 3 }}>
            <TextField label="Easebuzz sub-merchant ID (Booking)" value={easebuzzBookingSubMerchantId} onChange={(e) => setEasebuzzBookingSubMerchantId(e.target.value)} placeholder="Enter Easebuzz sub-merchant ID" />
            <TextField label="Easebuzz sub-merchant ID (Milestone)" value={easebuzzMilestoneSubMerchantId} onChange={(e) => setEasebuzzMilestoneSubMerchantId(e.target.value)} placeholder="Enter Easebuzz sub-merchant ID" />
          </Box>

          <Divider sx={{ my: 4 }} />

          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={3}>
            <TextField label="Billing Name" value={billingName} onChange={(e) => setBillingName(e.target.value)} placeholder="Enter Billing Name" />
            <TextField label="PAN No." value={panNumber} onChange={(e) => setPanNumber(e.target.value.toUpperCase())} inputProps={{ maxLength: 10 }} placeholder="Enter PAN Number" />
            <TextField label="GSTIN" value={gstin} onChange={(e) => setGstin(e.target.value.toUpperCase())} inputProps={{ maxLength: 15 }} placeholder="Enter GSTIN" />
            <TextField label="Address Line 1" value={address1} onChange={(e) => setAddress1(e.target.value)} placeholder="Enter Address" />
            <TextField label="Address Line 2" value={address2} onChange={(e) => setAddress2(e.target.value)} placeholder="Enter Address" />
            <TextField label="PIN Code" value={pinCode} onChange={(e) => setPinCode(e.target.value)} inputProps={{ maxLength: 6 }} placeholder="Enter PIN Code" />
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Brand Logo */}
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Brand Logo</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Project Elevation Image</Typography>

          <Box
            sx={{
              border: '2px dashed',
              borderColor: logoUrl ? 'primary.main' : 'divider',
              borderRadius: 2,
              p: 2.5,
              textAlign: 'center',
              bgcolor: logoUrl ? 'primary.lighter' : 'grey.50',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'primary.lighter',
              },
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleLogoUpload} />

            {logoUrl ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <Avatar src={logoUrl} sx={{ width: 40, height: 40, borderRadius: 1 }} />
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {logoUrl.split('/').pop() || 'logo.png'}
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Click to upload brand logo
              </Typography>
            )}
          </Box>

          <Box sx={{ mt: 1.5 }}>
            <Typography variant="caption" color="text.disabled">JPEG, PNG, JPG, SVG (Max 10 MB)</Typography>
          </Box>

          {logoUrl && (
            <Stack direction="row" spacing={1} sx={{ mt: 2, justifyContent: 'flex-end' }}>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<Iconify icon="solar:trash-bin-trash-bold" width={16} />}
                onClick={handleRemoveLogo}
              >
                Delete
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="solar:eye-bold" width={16} />}
                onClick={handleViewLogo}
              >
                View
              </Button>
            </Stack>
          )}

          <Divider sx={{ my: 4 }} />

          {/* Incentive Criteria */}
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3 }}>Incentive Criteria</Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            {/* Left: RERA */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 2.5, color: 'text.secondary' }}>RERA / Under Construction</Typography>
              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2.5} sx={{ mb: 2.5 }}>
                <TextField
                  label="Regularization %"
                  value={reraRegularizationPercentage}
                  onChange={(e) => setReraRegularizationPercentage(Number(e.target.value))}
                  type="number"
                  inputProps={{ min: 0, max: 100 }}
                  placeholder="0.0"
                />
                <TextField
                  label="Payable"
                  value={reraQualificationPercentage}
                  onChange={(e) => setReraQualificationPercentage(Number(e.target.value))}
                  type="number"
                  inputProps={{ min: 0, max: 100 }}
                  placeholder="0.0"
                />
              </Box>
              <TextField
                label="Maximum Regularization Days"
                value={maximumRegularizationDays}
                onChange={(e) => setMaximumRegularizationDays(Number(e.target.value))}
                type="number"
                inputProps={{ min: 0 }}
                placeholder="Enter Days"
                fullWidth
              />
            </Box>

            {/* Vertical Divider */}
            <Box sx={{ width: '1px', bgcolor: 'divider', flexShrink: 0 }} />

            {/* Right: RTM */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 2.5, color: 'text.secondary' }}>RTM / OC Received</Typography>
              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2.5} sx={{ mb: 2.5 }}>
                <TextField
                  label="Regularization %"
                  value={rtmRegularizationPercentage}
                  onChange={(e) => setRtmRegularizationPercentage(Number(e.target.value))}
                  type="number"
                  inputProps={{ min: 0, max: 100 }}
                  placeholder="0.0"
                />
                <TextField
                  label="Payable"
                  value={rtmQualificationPercentage}
                  onChange={(e) => setRtmQualificationPercentage(Number(e.target.value))}
                  type="number"
                  inputProps={{ min: 0, max: 100 }}
                  placeholder="0.0"
                />
              </Box>
              <TextField
                label="Regularization Start Date"
                value={regularizationStartDate}
                onChange={(e) => setRegularizationStartDate(e.target.value)}
                type="date"
                InputLabelProps={{ shrink: true }}
                placeholder="Select Date"
                fullWidth
              />
            </Box>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Terms & Conditions */}
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3 }}>Terms &amp; Conditions</Typography>
          <Box sx={{ '& .ql-editor': { minHeight: 180 } }}>
            <ReactQuill
              value={termsAndConditions}
              onChange={setTermsAndConditions}
              modules={quillModules}
              placeholder="Enter terms and conditions..."
            />
          </Box>
        </Card>

        <Box sx={{ position: 'sticky', bottom: 0, zIndex: 10, bgcolor: 'background.default', borderTop: '1px solid', borderColor: 'divider', py: 2, px: 0 }}>
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
