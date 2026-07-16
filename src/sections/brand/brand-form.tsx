import type { Brand } from 'src/types';

import { Helmet } from 'react-helmet-async';
import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { mockBrands } from 'src/services/mock-data';

import { Iconify } from 'src/components/iconify';
import { FormSection } from 'src/components/form-section';
import { PageHeader, PageContainer } from 'src/components/page-layout';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

export default function BrandFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [brandData] = useState<Brand | undefined>(
    isEdit ? mockBrands.find((b) => b.id === id) : undefined
  );

  const [brandName, setBrandName] = useState(brandData?.brandName ?? '');
  const [billingName, setBillingName] = useState(brandData?.billingName ?? '');
  const [address1, setAddress1] = useState(brandData?.address1 ?? '');
  const [address2, setAddress2] = useState(brandData?.address2 ?? '');
  const [city, setCity] = useState(brandData?.city ?? '');
  const [state, setState] = useState(brandData?.state ?? '');
  const [country, setCountry] = useState(brandData?.country ?? '');
  const [pinCode, setPinCode] = useState(brandData?.pinCode ?? '');
  const [panNumber, setPanNumber] = useState(brandData?.panNumber ?? '');
  const [gstin, setGstin] = useState(brandData?.gstin ?? '');
  const [logoUrl, setLogoUrl] = useState(brandData?.logoUrl ?? '');
  const [salaryMultiplier, setSalaryMultiplier] = useState(brandData?.salaryMultiplier ?? 1);
  const [razorpayMerchantId, setRazorpayMerchantId] = useState(brandData?.razorpayMerchantId ?? '');
  const [razorpaySecretKey, setRazorpaySecretKey] = useState(brandData?.razorpaySecretKey ?? '');
  const [easebuzzBookingSalt, setEasebuzzBookingSalt] = useState(brandData?.easebuzzBookingSalt ?? '');
  const [easebuzzBookingKey, setEasebuzzBookingKey] = useState(brandData?.easebuzzBookingKey ?? '');
  const [easebuzzBookingSubMerchantId, setEasebuzzBookingSubMerchantId] = useState(brandData?.easebuzzBookingSubMerchantId ?? '');
  const [easebuzzMilestoneSalt, setEasebuzzMilestoneSalt] = useState(brandData?.easebuzzMilestoneSalt ?? '');
  const [easebuzzMilestoneKey, setEasebuzzMilestoneKey] = useState(brandData?.easebuzzMilestoneKey ?? '');
  const [easebuzzMilestoneSubMerchantId, setEasebuzzMilestoneSubMerchantId] = useState(brandData?.easebuzzMilestoneSubMerchantId ?? '');
  const [reraRegularizationPercentage, setReraRegularizationPercentage] = useState(brandData?.reraRegularizationPercentage ?? 5);
  const [reraQualificationPercentage, setReraQualificationPercentage] = useState(brandData?.reraQualificationPercentage ?? 80);
  const [maximumRegularizationDays, setMaximumRegularizationDays] = useState(brandData?.maximumRegularizationDays ?? 30);
  const [rtmRegularizationPercentage, setRtmRegularizationPercentage] = useState(brandData?.rtmRegularizationPercentage ?? 3);
  const [rtmQualificationPercentage, setRtmQualificationPercentage] = useState(brandData?.rtmQualificationPercentage ?? 90);
  const [regularizationStartDate, setRegularizationStartDate] = useState(brandData?.regularizationStartDate ?? '');
  const [termsAndConditions, setTermsAndConditions] = useState(brandData?.termsAndConditions ?? '');

  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [brandNameError, setBrandNameError] = useState('');

  const handleSave = useCallback(() => {
    if (!brandName.trim()) {
      setBrandNameError('Brand name is required');
      return;
    }
    setBrandNameError('');

    setSaving(true);
    setTimeout(() => {
      if (isEdit && brandData) {
        Object.assign(brandData, {
          brandName: brandName.trim(), billingName, address1, address2, city, state, country,
          pinCode, panNumber, gstin, logoUrl, salaryMultiplier,
          razorpayMerchantId, razorpaySecretKey,
          easebuzzBookingSalt, easebuzzBookingKey, easebuzzBookingSubMerchantId,
          easebuzzMilestoneSalt, easebuzzMilestoneKey, easebuzzMilestoneSubMerchantId,
          reraRegularizationPercentage, reraQualificationPercentage, maximumRegularizationDays,
          rtmRegularizationPercentage, rtmQualificationPercentage, regularizationStartDate,
          termsAndConditions, updatedAt: new Date().toISOString(),
        });
      } else {
        mockBrands.unshift({
          id: String(Date.now()),
          brandName: brandName.trim(),
          billingName, address1, address2, city, state, country, pinCode,
          panNumber, gstin, logoUrl, salaryMultiplier,
          razorpayMerchantId, razorpaySecretKey,
          easebuzzBookingSalt, easebuzzBookingKey, easebuzzBookingSubMerchantId,
          easebuzzMilestoneSalt, easebuzzMilestoneKey, easebuzzMilestoneSubMerchantId,
          reraRegularizationPercentage, reraQualificationPercentage, maximumRegularizationDays,
          rtmRegularizationPercentage, rtmQualificationPercentage, regularizationStartDate,
          termsAndConditions, status: 'active', createdBy: 'Rohit Palkar',
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        });
      }

      setSaving(false);
      setShowSuccess(true);
      setTimeout(() => navigate(paths.dashboard.brandMaster), 1200);
    }, 800);
  }, [brandName, billingName, address1, address2, city, state, country, pinCode, panNumber, gstin, logoUrl, salaryMultiplier,
    razorpayMerchantId, razorpaySecretKey,
    easebuzzBookingSalt, easebuzzBookingKey, easebuzzBookingSubMerchantId,
    easebuzzMilestoneSalt, easebuzzMilestoneKey, easebuzzMilestoneSubMerchantId,
    reraRegularizationPercentage, reraQualificationPercentage, maximumRegularizationDays,
    rtmRegularizationPercentage, rtmQualificationPercentage, regularizationStartDate,
    termsAndConditions, isEdit, brandData, navigate]);

  if (isEdit && !brandData) {
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
          {/* General */}
          <Card sx={{ p: 3 }}>
            <FormSection title="General Information" description="Basic brand identity details">
              <TextField label="Brand Name" value={brandName} onChange={(e) => { setBrandName(e.target.value); setBrandNameError(''); }} error={!!brandNameError} helperText={brandNameError} required fullWidth />
              <TextField label="Billing Name" value={billingName} onChange={(e) => setBillingName(e.target.value)} fullWidth />
              <TextField label="Address Line 1" value={address1} onChange={(e) => setAddress1(e.target.value)} fullWidth />
              <TextField label="Address Line 2" value={address2} onChange={(e) => setAddress2(e.target.value)} fullWidth />
              <TextField label="City" value={city} onChange={(e) => setCity(e.target.value)} fullWidth />
              <TextField label="State" value={state} onChange={(e) => setState(e.target.value)} select fullWidth>
                {INDIAN_STATES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
              <TextField label="Country" value={country} onChange={(e) => setCountry(e.target.value)} fullWidth />
              <TextField label="PIN Code" value={pinCode} onChange={(e) => setPinCode(e.target.value)} inputProps={{ maxLength: 6 }} fullWidth />
              <TextField label="PAN Number" value={panNumber} onChange={(e) => setPanNumber(e.target.value.toUpperCase())} inputProps={{ maxLength: 10 }} fullWidth />
              <TextField label="GSTIN" value={gstin} onChange={(e) => setGstin(e.target.value.toUpperCase())} inputProps={{ maxLength: 15 }} fullWidth />
            </FormSection>
          </Card>

          {/* Branding */}
          <Card sx={{ p: 3 }}>
            <FormSection title="Branding" description="Logo and multiplier configuration">
              <TextField label="Logo URL" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} fullWidth />
              <TextField label="Salary Multiplier" value={salaryMultiplier} onChange={(e) => setSalaryMultiplier(Number(e.target.value))} type="number" inputProps={{ step: 0.1, min: 0 }} fullWidth />
            </FormSection>
          </Card>

          {/* Financial */}
          <Card sx={{ p: 3 }}>
            <FormSection title="Financial" description="Razorpay payment gateway configuration">
              <TextField label="Razorpay Merchant ID" value={razorpayMerchantId} onChange={(e) => setRazorpayMerchantId(e.target.value)} fullWidth />
              <TextField label="Razorpay Secret Key" value={razorpaySecretKey} onChange={(e) => setRazorpaySecretKey(e.target.value)} type="password" fullWidth />
            </FormSection>
          </Card>

          {/* Payment */}
          <Card sx={{ p: 3 }}>
            <FormSection title="Payment Gateway Integration" description="Easebuzz configuration for booking and milestone payments">
              <Typography variant="subtitle2" sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>Booking Payments</Typography>
              <TextField label="Easebuzz Booking Salt" value={easebuzzBookingSalt} onChange={(e) => setEasebuzzBookingSalt(e.target.value)} fullWidth />
              <TextField label="Easebuzz Booking Key" value={easebuzzBookingKey} onChange={(e) => setEasebuzzBookingKey(e.target.value)} fullWidth />
              <TextField label="Easebuzz Booking Sub-Merchant ID" value={easebuzzBookingSubMerchantId} onChange={(e) => setEasebuzzBookingSubMerchantId(e.target.value)} fullWidth />
              <Typography variant="subtitle2" sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>Milestone Payments</Typography>
              <TextField label="Easebuzz Milestone Salt" value={easebuzzMilestoneSalt} onChange={(e) => setEasebuzzMilestoneSalt(e.target.value)} fullWidth />
              <TextField label="Easebuzz Milestone Key" value={easebuzzMilestoneKey} onChange={(e) => setEasebuzzMilestoneKey(e.target.value)} fullWidth />
              <TextField label="Easebuzz Milestone Sub-Merchant ID" value={easebuzzMilestoneSubMerchantId} onChange={(e) => setEasebuzzMilestoneSubMerchantId(e.target.value)} fullWidth />
            </FormSection>
          </Card>

          {/* Regulatory */}
          <Card sx={{ p: 3 }}>
            <FormSection title="Regulatory (RERA)" description="RERA and RTM regularization rules">
              <TextField label="RERA Regularization (%)" value={reraRegularizationPercentage} onChange={(e) => setReraRegularizationPercentage(Number(e.target.value))} type="number" inputProps={{ min: 0, max: 100 }} fullWidth />
              <TextField label="RERA Qualification (%)" value={reraQualificationPercentage} onChange={(e) => setReraQualificationPercentage(Number(e.target.value))} type="number" inputProps={{ min: 0, max: 100 }} fullWidth />
              <TextField label="Max Regularization Days" value={maximumRegularizationDays} onChange={(e) => setMaximumRegularizationDays(Number(e.target.value))} type="number" inputProps={{ min: 0 }} fullWidth />
              <TextField label="RTM Regularization (%)" value={rtmRegularizationPercentage} onChange={(e) => setRtmRegularizationPercentage(Number(e.target.value))} type="number" inputProps={{ min: 0, max: 100 }} fullWidth />
              <TextField label="RTM Qualification (%)" value={rtmQualificationPercentage} onChange={(e) => setRtmQualificationPercentage(Number(e.target.value))} type="number" inputProps={{ min: 0, max: 100 }} fullWidth />
              <TextField label="Regularization Start Date" value={regularizationStartDate} onChange={(e) => setRegularizationStartDate(e.target.value)} type="date" InputLabelProps={{ shrink: true }} fullWidth />
            </FormSection>
          </Card>

          {/* Legal */}
          <Card sx={{ p: 3 }}>
            <FormSection title="Legal" description="Terms and conditions">
              <TextField label="Terms &amp; Conditions" value={termsAndConditions} onChange={(e) => setTermsAndConditions(e.target.value)} multiline rows={4} sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }} fullWidth />
            </FormSection>
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
