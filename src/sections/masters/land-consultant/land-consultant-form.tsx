import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import Autocomplete from '@mui/material/Autocomplete';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import {
  useLandConsultantById,
  useCreateLandConsultant,
  useUpdateLandConsultant,
} from 'src/services/hooks/use-land-consultants';
import { useDepartmentList } from 'src/services/hooks/use-organization';
import { useUserList } from 'src/services/hooks/use-users';

import { PageHeader, PageContainer } from 'src/components/page-layout';

const SPECIALIZATIONS = [
  'Land Acquisition',
  'Due Diligence',
  'Liaison',
  'Legal',
  'Valuation',
  'Joint Development',
  'Feasibility Study',
];

export default function LandConsultantFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const consultantId = id ? Number(id) : undefined;

  const { data: consultantData, isLoading: isFetching, isError: isFetchError } = useLandConsultantById(consultantId ?? 0);
  const { mutateAsync: createConsultant, isPending: isCreating } = useCreateLandConsultant();
  const { mutateAsync: updateConsultant, isPending: isUpdating } = useUpdateLandConsultant();
  const { data: departmentsData } = useDepartmentList();
  const departments = useMemo(
    () => (departmentsData as any)?.data ?? departmentsData ?? [],
    [departmentsData]
  );
  const { data: usersResponse } = useUserList({ page: 1, limit: 100 } as any);
  const users: any[] = useMemo(() => {
    const usersRaw: any = usersResponse;
    return usersRaw?.data ?? (Array.isArray(usersRaw) ? usersRaw : []);
  }, [usersResponse]);

  const [consultantType, setConsultantType] = useState<'Individual' | 'Registered'>('Registered');
  const [businessName, setBusinessName] = useState('');
  const [consultantName, setConsultantName] = useState('');
  const [gstNo, setGstNo] = useState('');
  const [contactPersonName, setContactPersonName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [address, setAddress] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [bdExecutiveId, setBdExecutiveId] = useState('');
  const [isPuravankaraEmployee, setIsPuravankaraEmployee] = useState(false);
  const [departmentId, setDepartmentId] = useState<number | ''>('');
  const [employeeId, setEmployeeId] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const saving = isCreating || isUpdating;

  const bdOptions = useMemo(
    () => users.map((u: any) => ({ label: u.name || u.email, value: u.empId || u.id })),
    [users]
  );

  const departmentOptions = useMemo(
    () => (Array.isArray(departments) ? departments : []).map((d: any) => ({ label: d.name, value: d.id })),
    [departments]
  );

  useEffect(() => {
    if (consultantData) {
      const d: any = consultantData;
      const data = d.data ?? d;
      setConsultantType(data.consultantType || 'Registered');
      setBusinessName(data.businessName || '');
      setConsultantName(data.consultantName || '');
      setGstNo(data.gstNo || '');
      setContactPersonName(data.contactPersonName || '');
      setContactNumber(data.contactNumber || '');
      setEmailAddress(data.emailAddress || '');
      setAddress(data.address || '');
      setSpecialization(data.specialization || '');
      setBdExecutiveId(data.bdExecutiveId || '');
      setIsPuravankaraEmployee(!!data.isPuravankaraEmployee);
      setDepartmentId(data.departmentId || '');
      setEmployeeId(data.employeeId || '');
    }
  }, [consultantData]);

  const validate = useCallback(() => {
    const e: Record<string, string> = {};
    if (consultantType === 'Registered' && !businessName.trim()) e.businessName = 'Business Name is required';
    if (consultantType === 'Individual' && !consultantName.trim()) e.consultantName = 'Consultant Name is required';
    if (!contactPersonName.trim()) e.contactPersonName = 'Name is required';
    if (!contactNumber.trim()) e.contactNumber = 'Contact Number is required';
    else if (!/^[0-9]{10,15}$/.test(contactNumber.trim())) e.contactNumber = 'Must be 10-15 digits';
    if (!emailAddress.trim()) e.emailAddress = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress.trim())) e.emailAddress = 'Invalid email';
    if (!address.trim()) e.address = 'Address is required';
    if (!bdExecutiveId) e.bdExecutiveId = 'BD Executive is required';
    if (isPuravankaraEmployee) {
      if (!departmentId) e.departmentId = 'Department is required';
      if (!employeeId.trim()) e.employeeId = 'Employee ID is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [
    consultantType,
    businessName,
    consultantName,
    contactPersonName,
    contactNumber,
    emailAddress,
    address,
    bdExecutiveId,
    isPuravankaraEmployee,
    departmentId,
    employeeId,
  ]);

  const handleSave = useCallback(async () => {
    if (!validate()) return;
    const payload: any = {
      consultantType,
      contactPersonName: contactPersonName.trim(),
      contactNumber: contactNumber.trim(),
      emailAddress: emailAddress.trim(),
      address: address.trim(),
      specialization: specialization || undefined,
      bdExecutiveId,
      isPuravankaraEmployee: consultantType === 'Individual' ? isPuravankaraEmployee : false,
    };
    if (consultantType === 'Registered') {
      payload.businessName = businessName.trim();
      if (gstNo.trim()) payload.gstNo = gstNo.trim();
      // clear individual fields
      payload.consultantName = undefined;
    } else {
      payload.consultantName = consultantName.trim();
      if (gstNo.trim()) payload.gstNo = gstNo.trim();
      payload.businessName = undefined;
      if (isPuravankaraEmployee) {
        payload.departmentId = Number(departmentId);
        payload.employeeId = employeeId.trim();
      }
    }

    try {
      if (isEdit && consultantId) {
        await updateConsultant({ id: consultantId, data: payload });
      } else {
        await createConsultant(payload);
      }
      setShowSuccess(true);
      setTimeout(() => navigate(paths.dashboard.masters.consultants), 1200);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save';
      setErrors((prev) => ({ ...prev, submit: Array.isArray(msg) ? msg.join(', ') : String(msg) }));
    }
  }, [
    validate,
    consultantType,
    contactPersonName,
    contactNumber,
    emailAddress,
    address,
    specialization,
    bdExecutiveId,
    isPuravankaraEmployee,
    businessName,
    gstNo,
    consultantName,
    departmentId,
    employeeId,
    isEdit,
    consultantId,
    createConsultant,
    updateConsultant,
    navigate,
  ]);

  if (isEdit && isFetching) {
    return (
      <PageContainer>
        <PageHeader title="Edit Land Consultant" />
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

  if (isEdit && (isFetchError || (!isFetching && !consultantData))) {
    return (
      <PageContainer>
        <PageHeader title="Land Consultant Not Found" description="The requested consultant does not exist" />
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Land consultant with ID &quot;{id}&quot; not found.
          </Typography>
          <Button onClick={() => navigate(paths.dashboard.masters.consultants)} sx={{ mt: 2 }}>
            Back to Land Consultants
          </Button>
        </Card>
      </PageContainer>
    );
  }

  return (
    <>
      <Helmet>
        <title>{isEdit ? 'Edit Land Consultant' : 'Create Land Consultant'} - {CONFIG.appName}</title>
      </Helmet>
      <PageContainer>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
          {isEdit ? 'Edit Land Consultant' : 'Create Land Consultant'}
        </Typography>

        {saving && <LinearProgress sx={{ mb: 2 }} />}
        {errors.submit && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrors((p) => ({ ...p, submit: '' }))}>
            {errors.submit}
          </Alert>
        )}

        <Card
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: '16px',
            boxShadow: '0px 2px 16px rgba(0,0,0,0.06)',
          }}
        >
          {/* Consultant Details */}
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
            Consultant Details
          </Typography>

          <FormControl component="fieldset" sx={{ mb: 3 }}>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
              Consultant Type <Box component="span" sx={{ color: 'error.main' }}>*</Box>
            </Typography>
            <RadioGroup
              row
              value={consultantType}
              onChange={(e) => setConsultantType(e.target.value as any)}
            >
              <FormControlLabel
                value="Individual"
                control={<Radio sx={{ color: '#1A237E', '&.Mui-checked': { color: '#1A237E' } }} />}
                label="Individual"
              />
              <FormControlLabel
                value="Registered"
                control={<Radio sx={{ color: '#1A237E', '&.Mui-checked': { color: '#1A237E' } }} />}
                label="Registered"
              />
            </RadioGroup>
          </FormControl>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 2.5,
              mb: 1,
            }}
          >
            {consultantType === 'Registered' ? (
              <TextField
                label="Business Name"
                placeholder="Enter Business Name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                error={!!errors.businessName}
                helperText={errors.businessName}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            ) : (
              <TextField
                label="Consultant Name"
                placeholder="Enter Consultant Name"
                value={consultantName}
                onChange={(e) => setConsultantName(e.target.value)}
                error={!!errors.consultantName}
                helperText={errors.consultantName}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            )}
            <TextField
              label="GST No."
              placeholder="Enter GST No."
              value={gstNo}
              onChange={(e) => setGstNo(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

          {/* Contact Person Details */}
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
            Contact Person Details
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 2.5,
            }}
          >
            <TextField
              label="Name"
              placeholder="Enter Contact Person Name"
              value={contactPersonName}
              onChange={(e) => setContactPersonName(e.target.value)}
              error={!!errors.contactPersonName}
              helperText={errors.contactPersonName}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Contact Number"
              placeholder="Enter Contact Number"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value.replace(/\D/g, '').slice(0, 15))}
              error={!!errors.contactNumber}
              helperText={errors.contactNumber}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Email Address"
              placeholder="Enter Contact Person Name"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              error={!!errors.emailAddress}
              helperText={errors.emailAddress}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Address"
              placeholder="Enter Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              error={!!errors.address}
              helperText={errors.address}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <Autocomplete
              options={SPECIALIZATIONS}
              value={specialization || null}
              onChange={(_, v) => setSpecialization(v || '')}
              renderInput={(params) => (
                <TextField {...params} label="Specialization" placeholder="Select Specialization" InputLabelProps={{ shrink: true }} />
              )}
            />
            <Autocomplete
              options={bdOptions}
              getOptionLabel={(o: any) => o.label}
              value={bdOptions.find((o) => o.value === bdExecutiveId) || null}
              onChange={(_, v: any) => setBdExecutiveId(v?.value || '')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="BD Executive"
                  placeholder="Select BD Executive"
                  error={!!errors.bdExecutiveId}
                  helperText={errors.bdExecutiveId}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Box>

          {consultantType === 'Individual' && (
            <Box sx={{ mt: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isPuravankaraEmployee}
                    onChange={(e) => setIsPuravankaraEmployee(e.target.checked)}
                    sx={{ color: '#1A237E', '&.Mui-checked': { color: '#1A237E' } }}
                  />
                }
                label="Puravankara employee"
              />
              {isPuravankaraEmployee && (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                    gap: 2.5,
                    mt: 2,
                  }}
                >
                  <Autocomplete
                    options={departmentOptions}
                    getOptionLabel={(o: any) => o.label}
                    value={departmentOptions.find((o) => o.value === departmentId) || null}
                    onChange={(_, v: any) => setDepartmentId(v?.value || '')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Department"
                        placeholder="Select Department"
                        error={!!errors.departmentId}
                        helperText={errors.departmentId}
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                  />
                  <TextField
                    label="Employee ID"
                    placeholder="Enter Employee ID"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    error={!!errors.employeeId}
                    helperText={errors.employeeId}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
              )}
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 4 }}>
            <Button
              variant="outlined"
              onClick={() => navigate(paths.dashboard.masters.consultants)}
              sx={{
                borderRadius: '8px',
                px: 4,
                textTransform: 'none',
                borderColor: '#E0E0E0',
                color: '#212121',
                fontWeight: 600,
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving}
              sx={{
                bgcolor: '#1A237E',
                '&:hover': { bgcolor: '#283593' },
                borderRadius: '8px',
                px: 4,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              {isEdit ? 'Update' : 'Create'}
            </Button>
          </Box>
        </Card>
      </PageContainer>

      <Snackbar
        open={showSuccess}
        autoHideDuration={2000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" sx={{ width: 1 }}>
          Land consultant {isEdit ? 'updated' : 'created'} successfully
        </Alert>
      </Snackbar>
    </>
  );
}
