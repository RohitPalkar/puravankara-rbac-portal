import type { CreateChannelPartnerRequest, UpdateChannelPartnerRequest } from 'src/services/types/channel-partner';

import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { queryKeys } from 'src/services/api/query-keys';
import { channelPartnerTypeService } from 'src/services/services/channel-partner.service';
import {
  useChannelPartnerById,
  useCreateChannelPartner,
  useUpdateChannelPartner,
} from 'src/services/hooks/use-channel-partners';

import { Iconify } from 'src/components/iconify';
import { FormSection } from 'src/components/form-section';
import { PageHeader, PageContainer } from 'src/components/page-layout';

export default function ChannelPartnerFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const cpId = id ? Number(id) : undefined;

  const { data: cpData, isLoading: isFetching, isError: isFetchError } = useChannelPartnerById(cpId ?? 0);
  const { mutateAsync: createChannelPartner, isPending: isCreating } = useCreateChannelPartner();
  const { mutateAsync: updateChannelPartner, isPending: isUpdating } = useUpdateChannelPartner();

  const [cpIdField, setCpIdField] = useState('');
  const [cpName, setCpName] = useState('');
  const [cpTypeId, setCpTypeId] = useState<number | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [showSuccess, setShowSuccess] = useState(false);
  const [cpNameError, setCpNameError] = useState('');

  const saving = isCreating || isUpdating;

  const { data: cpTypes } = useQuery({
    queryKey: queryKeys.channelPartnerTypes.list({}),
    queryFn: async () => {
      const res = await channelPartnerTypeService.list({});
      return res.data;
    },
  });

  useEffect(() => {
    if (cpData) {
      setCpIdField(cpData.cpId);
      setCpName(cpData.cpName);
      setCpTypeId(cpData.cpTypeId);
      setStartDate(cpData.startDate ? cpData.startDate.slice(0, 10) : '');
      setEndDate(cpData.endDate ? cpData.endDate.slice(0, 10) : '');
    }
  }, [cpData]);

  const handleSave = useCallback(async () => {
    if (!cpName.trim()) {
      setCpNameError('CP Name is required');
      return;
    }
    setCpNameError('');

    const payload: CreateChannelPartnerRequest = {
      cpId: cpIdField.trim(),
      cpName: cpName.trim(),
      cpTypeId: cpTypeId as number,
      startDate,
      endDate: endDate || undefined,
      isActive: true,
    };

    try {
      if (isEdit && cpId) {
        await updateChannelPartner({ id: cpId, data: payload as UpdateChannelPartnerRequest });
      } else {
        await createChannelPartner(payload);
      }
      setShowSuccess(true);
      setTimeout(() => navigate(paths.dashboard.channelPartnerMaster), 1200);
    } catch {
      // handled by query cache invalidation
    }
  }, [cpIdField, cpName, cpTypeId, startDate, endDate, isEdit, cpId, createChannelPartner, updateChannelPartner, navigate]);

  if (isEdit && isFetching) {
    return (
      <PageContainer>
        <PageHeader title="Edit Channel Partner" />
        <Card sx={{ p: 4 }}>
          <Stack spacing={2}>
            <Skeleton variant="rectangular" height={52} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" height={52} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" height={52} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 1 }} />
          </Stack>
        </Card>
      </PageContainer>
    );
  }

  if (isEdit && (isFetchError || (!isFetching && !cpData))) {
    return (
      <PageContainer>
        <PageHeader title="Channel Partner Not Found" description="The requested channel partner does not exist" />
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">Channel Partner with ID &quot;{id}&quot; not found.</Typography>
          <Button onClick={() => navigate(paths.dashboard.channelPartnerMaster)} sx={{ mt: 2 }}>Back to Channel Partners</Button>
        </Card>
      </PageContainer>
    );
  }

  return (
    <>
      <Helmet><title>{isEdit ? 'Edit Channel Partner' : 'Create Channel Partner'} - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader
          title={isEdit ? 'Edit Channel Partner' : 'Create Channel Partner'}
          description={isEdit ? 'Update channel partner details' : 'Register a new channel partner'}
        />

        {saving && <LinearProgress />}

        <Card sx={{ p: 3 }}>
          <FormSection title="Basic Details">
            <TextField label="CP Name" value={cpName} onChange={(e) => { setCpName(e.target.value); setCpNameError(''); }} error={!!cpNameError} helperText={cpNameError} required fullWidth />
            <TextField label="CP ID" value={cpIdField} onChange={(e) => setCpIdField(e.target.value)} required fullWidth />
            <TextField label="CP Type" value={cpTypeId} onChange={(e) => setCpTypeId(Number(e.target.value) || '')} select required fullWidth>
              {cpTypes?.map((t) => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
            </TextField>
            <TextField label="Start Date" value={startDate} onChange={(e) => setStartDate(e.target.value)} type="date" InputLabelProps={{ shrink: true }} required fullWidth />
            <TextField label="End Date" value={endDate} onChange={(e) => setEndDate(e.target.value)} type="date" InputLabelProps={{ shrink: true }} fullWidth />
          </FormSection>
        </Card>

        <Box sx={{ position: 'sticky', bottom: 0, zIndex: 10, bgcolor: 'background.default', borderTop: '1px solid', borderColor: 'divider', py: 2, px: 0, mt: 3 }}>
          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => navigate(paths.dashboard.channelPartnerMaster)} size="large">
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
          Channel Partner {isEdit ? 'updated' : 'created'} successfully
        </Alert>
      </Snackbar>
    </>
  );
}
