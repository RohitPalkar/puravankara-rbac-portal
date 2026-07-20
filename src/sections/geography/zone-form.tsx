import { useState, useCallback, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { CONFIG } from 'src/config-global';
import { PageContainer, PageHeader } from 'src/components/page-layout';
import { Iconify } from 'src/components/iconify';
import { paths } from 'src/routes/paths';
import { useZoneById, useCreateZone, useUpdateZone } from 'src/services/hooks/use-geography';
import { cityService, cityZoneMappingService } from 'src/services/services/geography.service';
import { useMyPermissions } from 'src/services/hooks/use-permissions';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from 'src/services/api/query-keys';
import type { CreateZoneRequest, UpdateZoneRequest, City } from 'src/services/types/geography';

const SALARY_CAPPING_OPTIONS = [
  { value: 1, label: '1x' },
  { value: 1.25, label: '1.25x' },
  { value: 1.5, label: '1.5x' },
  { value: 1.75, label: '1.75x' },
  { value: 2, label: '2x' },
  { value: 2.5, label: '2.5x' },
  { value: 3, label: '3x' },
];

function hasZonePermission(
  permissions: { projects: { modules: { subModules: { name: string; actions: { code: string; allowed: boolean }[] }[] }[] }[] } | undefined,
  action: string
): boolean {
  if (!permissions) return false;
  return permissions.projects.some((project) =>
    project.modules.some((mod) =>
      mod.subModules.some((sub) =>
        sub.name === 'ZONES' && sub.actions.some((a) => a.code === action && a.allowed)
      )
    )
  );
}

export default function ZoneFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const zoneId = id ? Number(id) : undefined;

  const { data: permissions } = useMyPermissions();
  const canCreate = useMemo(() => hasZonePermission(permissions, 'CREATE'), [permissions]);
  const canEdit = useMemo(() => hasZonePermission(permissions, 'EDIT'), [permissions]);

  const { data: zoneData, isLoading: isFetching, isError: isFetchError } = useZoneById(zoneId ?? 0);
  const { mutateAsync: createZone, isPending: isCreating } = useCreateZone();
  const { mutateAsync: updateZone, isPending: isUpdating } = useUpdateZone();

  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [salaryCapping, setSalaryCapping] = useState(1);
  const [effectiveDate, setEffectiveDate] = useState<dayjs.Dayjs | null>(dayjs());
  const [showSuccess, setShowSuccess] = useState(false);
  const [nameError, setNameError] = useState('');

  const { data: allCities } = useQuery({
    queryKey: queryKeys.cities.list({}),
    queryFn: async () => {
      const res = await cityService.list({});
      return res.data;
    },
  });

  const { data: allMappings } = useQuery({
    queryKey: queryKeys.cityZoneMappings.all,
    queryFn: async () => {
      const res = await cityZoneMappingService.list();
      return res.data;
    },
  });

  const zoneMappings = useMemo(
    () => (allMappings ?? []).filter((m) => m.zoneId === zoneId),
    [allMappings, zoneId],
  );

  const mappedCityIds = useMemo(
    () => new Set(zoneMappings.map((m) => m.cityId)),
    [zoneMappings],
  );

  const [selectedAvailable, setSelectedAvailable] = useState<Set<number>>(new Set());
  const [selectedMapped, setSelectedMapped] = useState<Set<number>>(new Set());
  const [searchAvailable, setSearchAvailable] = useState('');
  const [searchMapped, setSearchMapped] = useState('');
  const [pendingAdditions, setPendingAdditions] = useState<Set<number>>(new Set());
  const [pendingRemovals, setPendingRemovals] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (zoneData) {
      setName(zoneData.name);
      setIsActive(zoneData.isActive);
      setSalaryCapping(zoneData.salaryCapping ?? 1);
      setEffectiveDate(zoneData.effectiveDate ? dayjs(zoneData.effectiveDate) : dayjs());
    }
  }, [zoneData]);

  useEffect(() => {
    setPendingAdditions(new Set());
    setPendingRemovals(new Set());
  }, [zoneId]);

  const availableCities = useMemo(() => {
    const mappedInDb = new Set(zoneMappings.map((m) => m.cityId));
    const added = pendingAdditions;
    const removed = pendingRemovals;
    return (allCities ?? []).filter((c) => {
      const inDb = mappedInDb.has(c.id);
      const willBeAdded = added.has(c.id);
      const willBeRemoved = removed.has(c.id);
      if (!inDb && !willBeAdded) return true;
      if (inDb && willBeRemoved) return true;
      return false;
    });
  }, [allCities, zoneMappings, pendingAdditions, pendingRemovals]);

  const mappedCities = useMemo(() => {
    const mappedInDb = new Set(zoneMappings.map((m) => m.cityId));
    const added = pendingAdditions;
    const removed = pendingRemovals;
    return (allCities ?? []).filter((c) => {
      const inDb = mappedInDb.has(c.id);
      const willBeAdded = added.has(c.id);
      const willBeRemoved = removed.has(c.id);
      if (inDb && !willBeRemoved) return true;
      if (!inDb && willBeAdded) return true;
      return false;
    });
  }, [allCities, zoneMappings, pendingAdditions, pendingRemovals]);

  const filteredAvailable = useMemo(
    () => availableCities.filter((c) => c.name.toLowerCase().includes(searchAvailable.toLowerCase())),
    [availableCities, searchAvailable],
  );

  const filteredMapped = useMemo(
    () => mappedCities.filter((c) => c.name.toLowerCase().includes(searchMapped.toLowerCase())),
    [mappedCities, searchMapped],
  );

  const handleMoveRight = useCallback(() => {
    setPendingAdditions((prev) => {
      const next = new Set(prev);
      selectedAvailable.forEach((cityId) => next.add(cityId));
      return next;
    });
    setPendingRemovals((prev) => {
      const next = new Set(prev);
      selectedAvailable.forEach((cityId) => next.delete(cityId));
      return next;
    });
    setSelectedAvailable(new Set());
  }, [selectedAvailable]);

  const handleMoveLeft = useCallback(() => {
    setPendingRemovals((prev) => {
      const next = new Set(prev);
      selectedMapped.forEach((cityId) => next.add(cityId));
      return next;
    });
    setPendingAdditions((prev) => {
      const next = new Set(prev);
      selectedMapped.forEach((cityId) => next.delete(cityId));
      return next;
    });
    setSelectedMapped(new Set());
  }, [selectedMapped]);

  const toggleSelectAvailable = useCallback((cityId: number) => {
    setSelectedAvailable((prev) => {
      const next = new Set(prev);
      if (next.has(cityId)) next.delete(cityId);
      else next.add(cityId);
      return next;
    });
  }, []);

  const toggleSelectMapped = useCallback((cityId: number) => {
    setSelectedMapped((prev) => {
      const next = new Set(prev);
      if (next.has(cityId)) next.delete(cityId);
      else next.add(cityId);
      return next;
    });
  }, []);

  const selectAllAvailable = useCallback(() => {
    setSelectedAvailable(new Set(filteredAvailable.map((c) => c.id)));
  }, [filteredAvailable]);

  const deselectAllAvailable = useCallback(() => {
    setSelectedAvailable(new Set());
  }, []);

  const selectAllMapped = useCallback(() => {
    setSelectedMapped(new Set(filteredMapped.map((c) => c.id)));
  }, [filteredMapped]);

  const deselectAllMapped = useCallback(() => {
    setSelectedMapped(new Set());
  }, []);

  const saving = isCreating || isUpdating;

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      setNameError('Zone name is required');
      return;
    }
    setNameError('');

    const effectiveDateStr = effectiveDate ? effectiveDate.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');

    try {
      let savedZoneId: number;

      if (isEdit && zoneId) {
        const payload: UpdateZoneRequest = { name: name.trim() };
        if (isActive !== zoneData?.isActive) payload.isActive = isActive;
        if (salaryCapping !== zoneData?.salaryCapping) payload.salaryCapping = salaryCapping;
        if (effectiveDateStr !== dayjs(zoneData?.effectiveDate).format('YYYY-MM-DD')) payload.effectiveDate = effectiveDateStr;
        await updateZone({ id: zoneId, data: payload });
        savedZoneId = zoneId;
      } else {
        const result = await createZone({
          name: name.trim(),
          isActive,
          salaryCapping,
          effectiveDate: effectiveDateStr,
        } as CreateZoneRequest);
        savedZoneId = result.id;
      }

      const operations: Promise<any>[] = [];
      const originalMapped = new Set(zoneMappings.map((m) => m.cityId));

      pendingAdditions.forEach((cityId) => {
        if (!originalMapped.has(cityId) && !zoneMappings.some((m) => m.cityId === cityId)) {
          operations.push(cityZoneMappingService.create({ cityId, zoneId: savedZoneId }));
        }
      });

      pendingRemovals.forEach((cityId) => {
        if (originalMapped.has(cityId) || zoneMappings.some((m) => m.cityId === cityId)) {
          operations.push(cityZoneMappingService.delete(cityId, savedZoneId));
        }
      });

      await Promise.all(operations);

      setShowSuccess(true);
      setTimeout(() => navigate(paths.dashboard.zoneMaster), 1200);
    } catch {
      // error handled by query cache invalidation
    }
  }, [name, isActive, salaryCapping, effectiveDate, isEdit, zoneId, zoneData, zoneMappings, pendingAdditions, pendingRemovals, createZone, updateZone, navigate]);

  if (isEdit && isFetching) {
    return (
      <PageContainer>
        <PageHeader title="Edit Zone" />
        <Card sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Card>
      </PageContainer>
    );
  }

  if (isEdit && (isFetchError || (!isFetching && !zoneData))) {
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

  if (isEdit && !canEdit) {
    return (
      <PageContainer>
        <PageHeader title="Access Denied" />
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="error">You do not have permission to edit zones.</Typography>
          <Button onClick={() => navigate(paths.dashboard.zoneMaster)} sx={{ mt: 2 }}>Back to Zones</Button>
        </Card>
      </PageContainer>
    );
  }

  if (!isEdit && !canCreate) {
    return (
      <PageContainer>
        <PageHeader title="Access Denied" />
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="error">You do not have permission to create zones.</Typography>
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
          description={isEdit ? 'Update zone details' : 'Add a new geographic zone'}
        />

        {saving && <LinearProgress />}

        <Card sx={{ p: 3, mb: 3 }}>
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
              select
              label="Salary Capping"
              value={salaryCapping}
              onChange={(e) => setSalaryCapping(Number(e.target.value))}
              fullWidth
            >
              {SALARY_CAPPING_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en">
              <DatePicker
                label="Effective Date"
                value={effectiveDate}
                onChange={(newValue) => setEffectiveDate(newValue)}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </LocalizationProvider>
            <TextField
              select
              label="Status"
              value={isActive ? 'active' : 'inactive'}
              onChange={(e) => setIsActive(e.target.value === 'active')}
              fullWidth
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
          </Box>
        </Card>

        <Card sx={{ p: 3, mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2.5 }}>City Mapping</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Map cities to this zone. Cities in the right column belong to this zone.
          </Typography>
          <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr auto 1fr' }} gap={2} alignItems="center">
            <Paper variant="outlined" sx={{ p: 1.5, minHeight: 300 }}>
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  Available Cities ({filteredAvailable.length})
                </Typography>
                <TextField
                  size="small"
                  placeholder="Search cities..."
                  value={searchAvailable}
                  onChange={(e) => setSearchAvailable(e.target.value)}
                  fullWidth
                />
                <Stack direction="row" spacing={0.5}>
                  <Button size="small" variant="text" onClick={selectAllAvailable}>All</Button>
                  <Button size="small" variant="text" onClick={deselectAllAvailable}>None</Button>
                  {selectedAvailable.size > 0 && (
                    <Chip label={`${selectedAvailable.size} selected`} size="small" />
                  )}
                </Stack>
                <Box sx={{ maxHeight: 220, overflow: 'auto' }}>
                  {filteredAvailable.map((city) => (
                    <FormControlLabel
                      key={city.id}
                      control={
                        <Checkbox
                          size="small"
                          checked={selectedAvailable.has(city.id)}
                          onChange={() => toggleSelectAvailable(city.id)}
                        />
                      }
                      label={city.name}
                      sx={{ width: 1, mx: 0, '& .MuiTypography-root': { fontSize: '0.875rem' } }}
                    />
                  ))}
                  {filteredAvailable.length === 0 && (
                    <Typography variant="body2" color="text.disabled" sx={{ py: 2, textAlign: 'center' }}>
                      No cities available
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Paper>

            <Stack spacing={1} sx={{ py: 2 }}>
              <Button
                variant="contained"
                size="small"
                onClick={handleMoveRight}
                disabled={selectedAvailable.size === 0}
                sx={{ minWidth: 40, px: 1 }}
              >
                <Iconify icon="solar:arrow-right-bold" />
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={handleMoveLeft}
                disabled={selectedMapped.size === 0}
                sx={{ minWidth: 40, px: 1 }}
              >
                <Iconify icon="solar:arrow-left-bold" />
              </Button>
            </Stack>

            <Paper variant="outlined" sx={{ p: 1.5, minHeight: 300 }}>
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  Mapped Cities ({filteredMapped.length})
                </Typography>
                <TextField
                  size="small"
                  placeholder="Search cities..."
                  value={searchMapped}
                  onChange={(e) => setSearchMapped(e.target.value)}
                  fullWidth
                />
                <Stack direction="row" spacing={0.5}>
                  <Button size="small" variant="text" onClick={selectAllMapped}>All</Button>
                  <Button size="small" variant="text" onClick={deselectAllMapped}>None</Button>
                  {selectedMapped.size > 0 && (
                    <Chip label={`${selectedMapped.size} selected`} size="small" />
                  )}
                </Stack>
                <Box sx={{ maxHeight: 220, overflow: 'auto' }}>
                  {filteredMapped.map((city) => (
                    <FormControlLabel
                      key={city.id}
                      control={
                        <Checkbox
                          size="small"
                          checked={selectedMapped.has(city.id)}
                          onChange={() => toggleSelectMapped(city.id)}
                        />
                      }
                      label={city.name}
                      sx={{ width: 1, mx: 0, '& .MuiTypography-root': { fontSize: '0.875rem' } }}
                    />
                  ))}
                  {filteredMapped.length === 0 && (
                    <Typography variant="body2" color="text.disabled" sx={{ py: 2, textAlign: 'center' }}>
                      No cities mapped
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Paper>
          </Box>
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
