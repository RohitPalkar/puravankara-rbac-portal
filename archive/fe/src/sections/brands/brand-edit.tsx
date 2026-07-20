import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { useBrands } from 'src/services/api-adapters';
import { isApiMode } from 'src/services/data-source';

import { Iconify } from 'src/components/iconify';
import { PageHeader, PageContainer } from 'src/components/page-layout';

export default function BrandEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: brands } = useBrands();
  const brandData = brands.find((b) => b.id === id);

  const [initialized, setInitialized] = useState(false);

  const [brandName, setBrandName] = useState('');
  const [salaryMultiplier, setSalaryMultiplier] = useState('');

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

  const [reraRegularizationPercentage, setReraRegularizationPercentage] = useState('');
  const [reraQualificationPercentage, setReraQualificationPercentage] = useState('');
  const [maximumRegularizationDays, setMaximumRegularizationDays] = useState('');
  const [rtmRegularizationPercentage, setRtmRegularizationPercentage] = useState('');
  const [rtmQualificationPercentage, setRtmQualificationPercentage] = useState('');
  const [regularizationStartDate, setRegularizationStartDate] = useState('');

  const [termsAndConditions, setTermsAndConditions] = useState('');

  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!initialized && brandData) {
      setBrandName(brandData.brandName);
      setSalaryMultiplier(String(brandData.salaryMultiplier));
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
      setReraRegularizationPercentage(brandData.reraRegularizationPercentage != null ? String(brandData.reraRegularizationPercentage) : '');
      setReraQualificationPercentage(brandData.reraQualificationPercentage != null ? String(brandData.reraQualificationPercentage) : '');
      setMaximumRegularizationDays(brandData.maximumRegularizationDays != null ? String(brandData.maximumRegularizationDays) : '');
      setRtmRegularizationPercentage(brandData.rtmRegularizationPercentage != null ? String(brandData.rtmRegularizationPercentage) : '');
      setRtmQualificationPercentage(brandData.rtmQualificationPercentage != null ? String(brandData.rtmQualificationPercentage) : '');
      setRegularizationStartDate(brandData.regularizationStartDate ?? '');
      setTermsAndConditions(brandData.termsAndConditions ?? '');
      setInitialized(true);
    }
  }, [initialized, brandData]);

  const handleSave = useCallback(async () => {
    setSaving(true);

    if (isApiMode()) {
      try {
        const { brandApi } = await import('src/services/api/brand-api');
        await brandApi.update(id!, {
          brandName: brandName.trim(),
          salaryMultiplier: Number(salaryMultiplier),
          razorpayMerchantId: razorpayMerchantId || undefined,
          razorpaySecretKey: razorpaySecretKey || undefined,
          easebuzzBookingSalt: easebuzzBookingSalt || undefined,
          easebuzzBookingKey: easebuzzBookingKey || undefined,
          easebuzzBookingSubMerchantId: easebuzzBookingSubMerchantId || undefined,
          easebuzzMilestoneSalt: easebuzzMilestoneSalt || undefined,
          easebuzzMilestoneKey: easebuzzMilestoneKey || undefined,
          easebuzzMilestoneSubMerchantId: easebuzzMilestoneSubMerchantId || undefined,
          billingName: billingName || undefined,
          panNumber: panNumber || undefined,
          gstin: gstin || undefined,
          address1: address1 || undefined,
          address2: address2 || undefined,
          pinCode: pinCode || undefined,
          logoUrl: logoUrl || undefined,
          reraRegularizationPercentage: reraRegularizationPercentage ? Number(reraRegularizationPercentage) : undefined,
          reraQualificationPercentage: reraQualificationPercentage ? Number(reraQualificationPercentage) : undefined,
          maximumRegularizationDays: maximumRegularizationDays ? Number(maximumRegularizationDays) : undefined,
          rtmRegularizationPercentage: rtmRegularizationPercentage ? Number(rtmRegularizationPercentage) : undefined,
          rtmQualificationPercentage: rtmQualificationPercentage ? Number(rtmQualificationPercentage) : undefined,
          regularizationStartDate: regularizationStartDate || undefined,
          termsAndConditions: termsAndConditions || undefined,
        });
      } catch (e) { console.error(e); }
    } else {
      const { mockBrands } = await import('src/services/mock-data');
      const idx = mockBrands.findIndex((b) => b.id === id);
      if (idx !== -1) {
        mockBrands[idx] = {
          ...mockBrands[idx],
          brandName: brandName.trim(),
          salaryMultiplier: Number(salaryMultiplier),
          razorpayMerchantId: razorpayMerchantId || undefined,
          razorpaySecretKey: razorpaySecretKey || undefined,
          easebuzzBookingSalt: easebuzzBookingSalt || undefined,
          easebuzzBookingKey: easebuzzBookingKey || undefined,
          easebuzzBookingSubMerchantId: easebuzzBookingSubMerchantId || undefined,
          easebuzzMilestoneSalt: easebuzzMilestoneSalt || undefined,
          easebuzzMilestoneKey: easebuzzMilestoneKey || undefined,
          easebuzzMilestoneSubMerchantId: easebuzzMilestoneSubMerchantId || undefined,
          billingName: billingName || undefined,
          panNumber: panNumber || undefined,
          gstin: gstin || undefined,
          address1: address1 || undefined,
          address2: address2 || undefined,
          pinCode: pinCode || undefined,
          logoUrl: logoUrl || undefined,
          reraRegularizationPercentage: reraRegularizationPercentage ? Number(reraRegularizationPercentage) : undefined,
          reraQualificationPercentage: reraQualificationPercentage ? Number(reraQualificationPercentage) : undefined,
          maximumRegularizationDays: maximumRegularizationDays ? Number(maximumRegularizationDays) : undefined,
          rtmRegularizationPercentage: rtmRegularizationPercentage ? Number(rtmRegularizationPercentage) : undefined,
          rtmQualificationPercentage: rtmQualificationPercentage ? Number(rtmQualificationPercentage) : undefined,
          regularizationStartDate: regularizationStartDate || undefined,
          termsAndConditions: termsAndConditions || undefined,
          updatedAt: new Date().toISOString(),
        };
      }
    }

    setSaving(false);
    setShowSuccess(true);
    setTimeout(() => navigate(paths.dashboard.brandMaster), 1200);
  }, [id, brandName, salaryMultiplier, razorpayMerchantId, razorpaySecretKey, easebuzzBookingSalt, easebuzzBookingKey, easebuzzBookingSubMerchantId, easebuzzMilestoneSalt, easebuzzMilestoneKey, easebuzzMilestoneSubMerchantId, billingName, panNumber, gstin, address1, address2, pinCode, logoUrl, reraRegularizationPercentage, reraQualificationPercentage, maximumRegularizationDays, rtmRegularizationPercentage, rtmQualificationPercentage, regularizationStartDate, termsAndConditions, navigate]);

  if (!brandData) {
    return (
      <PageContainer>
        <PageHeader title="Brand Not Found" description="The requested brand does not exist" />
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">Brand not found.</Typography>
          <Button onClick={() => navigate(paths.dashboard.brandMaster)} sx={{ mt: 2 }}>Back to Brands</Button>
        </Box>
      </PageContainer>
    );
  }

  return (
    <>
      <Helmet><title>Edit Brand - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader title="Edit Brand" description="Update brand configuration across all sections" />

        {saving && <LinearProgress />}

        <Typography variant="subtitle1" sx={{ mb: 2.5, mt: 3 }}>1. Brand Information</Typography>
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5}>
          <TextField label="Brand Name" value={brandName} onChange={(e) => setBrandName(e.target.value)} required fullWidth />
          <TextField label="Salary Multiplier" value={salaryMultiplier} onChange={(e) => setSalaryMultiplier(e.target.value)} type="number" placeholder="e.g. 1.0" fullWidth />
        </Box>

        <Divider sx={{ borderStyle: 'dashed', my: 3 }} />

        <Typography variant="subtitle1" sx={{ mb: 2.5 }}>2. Payment Gateway</Typography>
        <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary' }}>Razorpay</Typography>
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5} sx={{ mb: 2 }}>
          <TextField label="Merchant ID" value={razorpayMerchantId} onChange={(e) => setRazorpayMerchantId(e.target.value)} fullWidth />
          <TextField label="Secret Key" value={razorpaySecretKey} onChange={(e) => setRazorpaySecretKey(e.target.value)} fullWidth />
        </Box>

        <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary' }}>Easebuzz Booking</Typography>
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr 1fr' }} gap={2.5} sx={{ mb: 2 }}>
          <TextField label="Salt" value={easebuzzBookingSalt} onChange={(e) => setEasebuzzBookingSalt(e.target.value)} fullWidth />
          <TextField label="Key" value={easebuzzBookingKey} onChange={(e) => setEasebuzzBookingKey(e.target.value)} fullWidth />
          <TextField label="Sub Merchant ID" value={easebuzzBookingSubMerchantId} onChange={(e) => setEasebuzzBookingSubMerchantId(e.target.value)} fullWidth />
        </Box>

        <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary' }}>Easebuzz Milestone</Typography>
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr 1fr' }} gap={2.5}>
          <TextField label="Salt" value={easebuzzMilestoneSalt} onChange={(e) => setEasebuzzMilestoneSalt(e.target.value)} fullWidth />
          <TextField label="Key" value={easebuzzMilestoneKey} onChange={(e) => setEasebuzzMilestoneKey(e.target.value)} fullWidth />
          <TextField label="Sub Merchant ID" value={easebuzzMilestoneSubMerchantId} onChange={(e) => setEasebuzzMilestoneSubMerchantId(e.target.value)} fullWidth />
        </Box>

        <Divider sx={{ borderStyle: 'dashed', my: 3 }} />

        <Typography variant="subtitle1" sx={{ mb: 2.5 }}>3. Billing</Typography>
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5}>
          <TextField label="Billing Name" value={billingName} onChange={(e) => setBillingName(e.target.value)} fullWidth />
          <TextField label="PAN Number" value={panNumber} onChange={(e) => setPanNumber(e.target.value)} placeholder="e.g. AAACP1234H" fullWidth />
          <TextField label="GSTIN" value={gstin} onChange={(e) => setGstin(e.target.value)} placeholder="e.g. 29AAACP1234H1Z5" fullWidth />
          <TextField label="PIN Code" value={pinCode} onChange={(e) => setPinCode(e.target.value)} placeholder="6 digits" fullWidth />
          <TextField label="Address 1" value={address1} onChange={(e) => setAddress1(e.target.value)} fullWidth sx={{ gridColumn: { sm: 'span 2' } }} />
          <TextField label="Address 2" value={address2} onChange={(e) => setAddress2(e.target.value)} fullWidth sx={{ gridColumn: { sm: 'span 2' } }} />
        </Box>

        <Divider sx={{ borderStyle: 'dashed', my: 3 }} />

        <Typography variant="subtitle1" sx={{ mb: 2.5 }}>4. Brand Logo</Typography>
        <TextField label="Logo URL" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://example.com/logo.png" helperText="Supported: JPG, JPEG, PNG, SVG. Max 10 MB" fullWidth />

        <Divider sx={{ borderStyle: 'dashed', my: 3 }} />

        <Typography variant="subtitle1" sx={{ mb: 2.5 }}>5. Incentive Criteria</Typography>

        <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary' }}>RERA</Typography>
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr 1fr' }} gap={2.5} sx={{ mb: 2 }}>
          <TextField label="Regularization %" value={reraRegularizationPercentage} onChange={(e) => setReraRegularizationPercentage(e.target.value)} type="number" placeholder="0-100" fullWidth />
          <TextField label="Qualification %" value={reraQualificationPercentage} onChange={(e) => setReraQualificationPercentage(e.target.value)} type="number" placeholder="0-100" fullWidth />
          <TextField label="Max Regularization Days" value={maximumRegularizationDays} onChange={(e) => setMaximumRegularizationDays(e.target.value)} type="number" fullWidth />
        </Box>

        <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary' }}>RTM / OC</Typography>
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5}>
          <TextField label="Regularization %" value={rtmRegularizationPercentage} onChange={(e) => setRtmRegularizationPercentage(e.target.value)} type="number" placeholder="0-100" fullWidth />
          <TextField label="Qualification %" value={rtmQualificationPercentage} onChange={(e) => setRtmQualificationPercentage(e.target.value)} type="number" placeholder="0-100" fullWidth />
          <TextField label="Regularization Start Date" value={regularizationStartDate} onChange={(e) => setRegularizationStartDate(e.target.value)} type="date" fullWidth InputLabelProps={{ shrink: true }} />
        </Box>

        <Divider sx={{ borderStyle: 'dashed', my: 3 }} />

        <Typography variant="subtitle1" sx={{ mb: 2.5 }}>6. Terms & Conditions</Typography>
        <TextField
          label="Terms & Conditions"
          value={termsAndConditions}
          onChange={(e) => setTermsAndConditions(e.target.value)}
          multiline
          rows={6}
          placeholder="Enter HTML content for terms and conditions..."
          fullWidth
        />

        <Box sx={{ position: 'sticky', bottom: 0, zIndex: 10, bgcolor: 'background.default', borderTop: '1px solid', borderColor: 'divider', py: 2, px: 0, mt: 3 }}>
          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => navigate(paths.dashboard.brandMaster)} size="large">Cancel</Button>
            <Button variant="contained" startIcon={<Iconify icon="solar:check-circle-bold" />} onClick={handleSave} disabled={saving} size="large">
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </Stack>
        </Box>
      </PageContainer>

      <Snackbar open={showSuccess} autoHideDuration={2000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" sx={{ width: 1 }}>
          Brand updated successfully
        </Alert>
      </Snackbar>
    </>
  );
}