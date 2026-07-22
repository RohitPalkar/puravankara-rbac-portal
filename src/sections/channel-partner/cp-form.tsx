import type { ChannelPartner } from 'src/types';

import { Helmet } from 'react-helmet-async';
import { useMemo, useState, useCallback } from 'react';
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
import { mockChannelPartners, mockChannelPartnerTypes } from 'src/services/mock-data';

import { Iconify } from 'src/components/iconify';
import { FormSection } from 'src/components/form-section';
import { PageHeader, PageContainer } from 'src/components/page-layout';

export default function ChannelPartnerFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [cpData] = useState<ChannelPartner | undefined>(
    isEdit ? mockChannelPartners.find((cp) => cp.id === id) : undefined
  );

  const [cpId, setCpId] = useState(cpData?.cpId ?? '');
  const [cpName, setCpName] = useState(cpData?.cpName ?? '');
  const [cpTypeId, setCpTypeId] = useState(cpData?.cpTypeId ?? '');
  const [startDate, setStartDate] = useState(cpData?.startDate ?? '');
  const [endDate, setEndDate] = useState(cpData?.endDate ?? '');

  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [cpNameError, setCpNameError] = useState('');

  const handleSave = useCallback(() => {
    if (!cpName.trim()) {
      setCpNameError('CP Name is required');
      return;
    }
    setCpNameError('');

    setSaving(true);
    setTimeout(() => {
      const cpType = mockChannelPartnerTypes.find((t) => t.id === cpTypeId);

      if (isEdit && cpData) {
        Object.assign(cpData, {
          cpId, cpName: cpName.trim(), cpTypeId, cpTypeName: cpType?.name,
          startDate, endDate, updatedAt: new Date().toISOString(),
        });
      } else {
        mockChannelPartners.unshift({
          id: String(Date.now()),
          cpId, cpName: cpName.trim(), cpTypeId, cpTypeName: cpType?.name ?? '',
          startDate, endDate, status: 'active', createdBy: 'Rohit Palkar',
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        });
      }

      setSaving(false);
      setShowSuccess(true);
      setTimeout(() => navigate(paths.dashboard.channelPartnerMaster), 1200);
    }, 800);
  }, [cpId, cpName, cpTypeId, startDate, endDate, isEdit, cpData, navigate]);

  if (isEdit && !cpData) {
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
          <FormSection title="Basic Details" description="Channel partner identity and enrollment period">
            <TextField label="CP Name" value={cpName} onChange={(e) => { setCpName(e.target.value); setCpNameError(''); }} error={!!cpNameError} helperText={cpNameError} required fullWidth />
            <TextField label="CP ID" value={cpId} onChange={(e) => setCpId(e.target.value)} required fullWidth />
            <TextField label="CP Type" value={cpTypeId} onChange={(e) => setCpTypeId(e.target.value)} select required fullWidth>
              {mockChannelPartnerTypes.map((t) => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
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
