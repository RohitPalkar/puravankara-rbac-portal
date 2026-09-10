import type { CreateLandConsultantRequest, UpdateLandConsultantRequest } from 'src/services/types/master';

import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { useAllMasterCities, useLandConsultantById, useCreateLandConsultant, useUpdateLandConsultant } from 'src/services/hooks/use-masters';

import { Iconify } from 'src/components/iconify';
import { FormSection } from 'src/components/form-section';
import { PageHeader, PageContainer } from 'src/components/page-layout';

export default function LandConsultantFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const consultantId = id ? Number(id) : undefined;

  const { data: consultantData, isLoading: isFetching, isError: isFetchError } = useLandConsultantById(consultantId ?? 0);
  const { data: cities } = useAllMasterCities();
  const { mutateAsync: createConsultant, isPending: isCreating } = useCreateLandConsultant();
  const { mutateAsync: updateConsultant, isPending: isUpdating } = useUpdateLandConsultant();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [cityIds, setCityIds] = useState<number[]>([]);
  const [specialisation, setSpecialisation] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  const [nameError, setNameError] = useState('');
  const [contactError, setContactError] = useState('');

  const saving = isCreating || isUpdating;

  useEffect(() => {
    if (consultantData) {
      setCode(consultantData.code);
      setName(consultantData.name);
      setContactPerson(consultantData.contactPerson);
      setMobile(consultantData.mobile);
      setEmail(consultantData.email);
      setCityIds(consultantData.cityIds ?? []);
      setSpecialisation(consultantData.specialisation);
      setIsActive(consultantData.isActive);
    }
  }, [consultantData]);

  const toggleCity = useCallback((cityId: number) => {
    setCityIds((prev) => (prev.includes(cityId) ? prev.filter((c) => c !== cityId) : [...prev, cityId]));
  }, []);

  const handleSave = useCallback(async () => {
    let valid = true;
    if (!name.trim()) { setNameError('Consultant name is required'); valid = false; } else setNameError('');
    if (!contactPerson.trim()) { setContactError('Contact person is required'); valid = false; } else setContactError('');
    if (!valid) return;

    const payload: CreateLandConsultantRequest = {
      code: code.trim(),
      name: name.trim(),
      contactPerson: contactPerson.trim(),
      mobile: mobile.trim(),
      email: email.trim(),
      cityIds,
      specialisation: specialisation.trim(),
      isActive,
    };

    try {
      if (isEdit && consultantId) {
        await updateConsultant({ id: consultantId, data: payload as UpdateLandConsultantRequest });
      } else {
        await createConsultant(payload);
      }
      setShowSuccess(true);
      setTimeout(() => navigate(paths.dashboard.masters.consultants), 1200);
    } catch {
      // error handled by query cache invalidation
    }
  }, [code, name, contactPerson, mobile, email, cityIds, specialisation, isActive, isEdit, consultantId, createConsultant, updateConsultant, navigate]);

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
          <Typography variant="body1" color="text.secondary">Land consultant with ID &quot;{id}&quot; not found.</Typography>
          <Button onClick={() => navigate(paths.dashboard.masters.consultants)} sx={{ mt: 2 }}>Back to Land Consultants</Button>
        </Card>
      </PageContainer>
    );
  }

  return (
    <>
      <Helmet><title>{isEdit ? 'Edit Land Consultant' : 'Add Land Consultant'} - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader
          title={isEdit ? 'Edit Land Consultant' : 'Add Land Consultant'}
          description={isEdit ? 'Update consultant details' : 'Add a new land consultant'}
        />

        {saving && <LinearProgress />}

        <Card sx={{ p: 4 }}>
          <FormSection title="Consultant Information">
            <TextField
              label="Consultant Code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. LC001"
            />
            <TextField
              label="Consultant Name"
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError(''); }}
              error={!!nameError}
              helperText={nameError}
              required
            />
            <TextField
              label="Contact Person"
              value={contactPerson}
              onChange={(e) => { setContactPerson(e.target.value); setContactError(''); }}
              error={!!contactError}
              helperText={contactError}
              required
            />
            <TextField label="Mobile Number" value={mobile} onChange={(e) => setMobile(e.target.value)} />
            <TextField label="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
            <TextField
              label="Specialisation"
              value={specialisation}
              onChange={(e) => setSpecialisation(e.target.value)}
              placeholder="e.g. Land Acquisition / Due Diligence"
            />
          </FormSection>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>Cities / Service Areas</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {(cities ?? []).map((city) => (
                <Button
                  key={city.id}
                  size="small"
                  variant={cityIds.includes(city.id) ? 'contained' : 'outlined'}
                  onClick={() => toggleCity(city.id)}
                >
                  {city.name}
                </Button>
              ))}
              {(cities ?? []).length === 0 && (
                <Typography variant="body2" color="text.disabled">No cities available.</Typography>
              )}
            </Box>
          </Box>

          {isEdit && (
            <FormSection title="Status">
              <TextField
                select
                label="Status"
                value={isActive ? 'active' : 'inactive'}
                onChange={(e) => setIsActive(e.target.value === 'active')}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
              <Box />
            </FormSection>
          )}
        </Card>

        <Box sx={{ position: 'sticky', bottom: 0, zIndex: 10, bgcolor: 'background.default', borderTop: '1px solid', borderColor: 'divider', py: 2, px: 0, mt: 3 }}>
          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => navigate(paths.dashboard.masters.consultants)} size="large">
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
          Land consultant {isEdit ? 'updated' : 'created'} successfully
        </Alert>
      </Snackbar>
    </>
  );
}
