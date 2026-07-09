import { useState, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import { CONFIG } from 'src/config-global';
import { PageContainer, PageHeader } from 'src/components/page-layout';
import { Iconify } from 'src/components/iconify';
import { DualListTransfer, type DualListItem } from 'src/components/dual-list';
import { mockZones, mockCities } from 'src/services/mock-data';
import { paths } from 'src/routes/paths';
import type { Zone } from 'src/types';

function generateZoneCode(existing: Zone[]): string {
  const maxNum = existing.reduce((max, z) => {
    const match = z.code.match(/Z-(\d+)/);
    return match ? Math.max(max, parseInt(match[1], 10)) : max;
  }, 0);
  return `Z-${String(maxNum + 1).padStart(2, '0')}`;
}

export default function ZoneFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [zoneData] = useState<Zone | undefined>(
    isEdit ? mockZones.find((zn) => zn.id === id) : undefined
  );
  const [name, setName] = useState(zoneData?.name ?? '');
  const [code, setCode] = useState(zoneData?.code ?? generateZoneCode(mockZones));
  const [description, setDescription] = useState(zoneData?.description ?? '');
  const status = 'active' as const;
  const [mappedCityIds, setMappedCityIds] = useState<string[]>(
    zoneData ? mockCities.filter((c) => c.zoneId === zoneData.id).map((c) => c.id) : []
  );
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [nameError, setNameError] = useState('');
  const [cityError, setCityError] = useState('');

  const selectedCityItems: DualListItem[] = useMemo(
    () => mockCities.filter((c) => mappedCityIds.includes(c.id)).map((c) => ({ id: c.id, label: c.name })),
    [mappedCityIds]
  );

  const availableCityItems: DualListItem[] = useMemo(
    () => mockCities.filter((c) => !mappedCityIds.includes(c.id)).map((c) => ({ id: c.id, label: c.name })),
    [mappedCityIds]
  );

  const handleMove = useCallback((ids: string[]) => {
    setMappedCityIds((prev) => [...prev, ...ids]);
    setCityError('');
  }, []);

  const handleRemove = useCallback((selectedIds: string[]) => {
    setMappedCityIds((prev) => prev.filter((pid) => !selectedIds.includes(pid)));
  }, []);

  const handleSave = useCallback(() => {
    let valid = true;

    if (!name.trim()) {
      setNameError('Zone name is required');
      valid = false;
    } else {
      setNameError('');
    }

    if (mappedCityIds.length === 0) {
      setCityError('At least one city must be mapped');
      valid = false;
    } else {
      setCityError('');
    }

    if (!valid) return;

    setSaving(true);

    setTimeout(() => {
      if (isEdit && zoneData) {
        Object.assign(zoneData, { name: name.trim(), code, description: description.trim(), status, updatedAt: new Date().toISOString() });
      } else {
        mockZones.unshift({
          id: String(Date.now()),
          name: name.trim(),
          code,
          description: description.trim(),
          status,
          createdBy: 'Rohit Palkar',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      mockCities.forEach((c) => {
        c.zoneId = mappedCityIds.includes(c.id) ? (isEdit && zoneData ? zoneData.id : mockZones[0].id) : '';
      });

      setSaving(false);
      setShowSuccess(true);

      setTimeout(() => navigate(paths.dashboard.zoneMaster), 1200);
    }, 800);
  }, [name, code, description, status, mappedCityIds, isEdit, zoneData, navigate]);

  if (isEdit && !zoneData) {
    return (
      <PageContainer>
        <PageHeader title="Zone Not Found" description="The requested zone does not exist" />
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">Zone with ID &quot;{id}&quot; not found.</Typography>
          <Button onClick={() => navigate(paths.dashboard.zoneMaster)} sx={{ mt: 2 }}>Back to Zones</Button>
        </Card>
      </PageContainer>
    );
  }

  return (
    <>
      <Helmet><title>{isEdit ? 'Edit Zone' : 'Create Zone'} - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader
          title={isEdit ? 'Edit Zone' : 'Create Zone'}
          description={isEdit ? 'Update zone details and city mappings' : 'Add a new geographic zone'}
        />

        {saving && <LinearProgress />}

        <Card sx={{ p: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2.5 }}>Zone Details</Typography>
          <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5}>
            <TextField
              label="Zone Name"
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError(''); }}
              error={!!nameError}
              helperText={nameError}
              required
              fullWidth
            />
            <TextField
              label="Zone Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled
              helperText="Auto-generated by system"
              fullWidth
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={2}
              fullWidth
              sx={{ gridColumn: { sm: 'span 2' } }}
            />
            
          </Box>
        </Card>

        <Card sx={{ p: 3, mt: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 0.5 }}>City Mapping</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            Select cities to map to this zone
          </Typography>
          {cityError && (
            <Alert severity="error" sx={{ mb: 2 }}>{cityError}</Alert>
          )}
          <DualListTransfer
            availableItems={availableCityItems}
            selectedItems={selectedCityItems}
            onMove={handleMove}
            onRemove={handleRemove}
            availableTitle="Available Cities"
            selectedTitle="Mapped Cities"
            availableSearchPlaceholder="Search cities..."
            selectedSearchPlaceholder="Search mapped..."
          />
        </Card>

        <Box sx={{ position: 'sticky', bottom: 0, zIndex: 10, bgcolor: 'background.default', borderTop: '1px solid', borderColor: 'divider', py: 2, px: 0, mt: 3 }}>
          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => navigate(paths.dashboard.zoneMaster)} size="large">
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
          Zone {isEdit ? 'updated' : 'created'} successfully
        </Alert>
      </Snackbar>
    </>
  );
}
