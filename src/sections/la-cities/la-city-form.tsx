import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Autocomplete from '@mui/material/Autocomplete';
import LinearProgress from '@mui/material/LinearProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Radio from '@mui/material/Radio';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { CONFIG } from 'src/config-global';
import { useLaCityById, useCreateLaCity, useUpdateLaCity } from 'src/services/hooks/use-la-cities';

import { Iconify } from 'src/components/iconify';
import { PageContainer } from 'src/components/page-layout';
import { useZoneList } from 'src/services/hooks/use-geography';

const STEPS = ['City Details', 'Approvals & Department Mapping'];

const GENERIC_APPROVALS = [
  'Land-use conversion (CLU)',
  'Land-records sketch',
  'Layout / DP approval',
  'Building Plan Sanction',
  'Environmental clearance',
  'Pollution consent (CFE/CTE)',
  'Airport height NOC',
  'Fire NOC',
  'Power connection NOC',
  'Water & sewerage NOC',
  'Metro / infra NOC',
  'Property record / mutation',
  'RERA registration',
  'Treasury / statutory fees',
  'State industrial land body',
];

function AddRegionDialog({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (name: string) => void }) {
  const [name, setName] = useState('');
  useEffect(() => { if (open) setName(''); }, [open]);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Region
        <IconButton onClick={onClose}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Region Name"
          placeholder="Enter Region Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          InputLabelProps={{ shrink: true }}
          sx={{ mt: 2 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              if (name.trim()) {
                onSubmit(name.trim());
                onClose();
              }
            }}
            sx={{ borderRadius: '6px', textTransform: 'none' }}
          >
            + Add Region
          </Button>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: '8px', px: 3 }}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            if (name.trim()) {
              onSubmit(name.trim());
              onClose();
            }
          }}
          variant="contained"
          sx={{ bgcolor: '#1A237E', borderRadius: '8px', px: 3 }}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function AddMicromarketDialog({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (names: string[]) => void;
}) {
  const [names, setNames] = useState<string[]>(['']);
  useEffect(() => { if (open) setNames(['']); }, [open]);
  const add = () => setNames([...names, '']);
  const remove = (i: number) => setNames(names.filter((_, idx) => idx !== i));
  const change = (i: number, v: string) => {
    const n = [...names];
    n[i] = v;
    setNames(n);
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Micromarket
        <IconButton onClick={onClose}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Central Pune
        </Typography>
        {names.map((n, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1.5, alignItems: 'center' }}>
            <TextField
              placeholder={i === 0 ? 'Shivajinagar' : 'Enter Micromarket Name'}
              value={n}
              onChange={(e) => change(i, e.target.value)}
              fullWidth
              size="small"
            />
            <IconButton color="error" onClick={() => remove(i)} disabled={names.length === 1}>
              <Iconify icon="solar:minus-circle-bold" width={20} />
            </IconButton>
          </Box>
        ))}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
          <Button variant="outlined" size="small" onClick={add} sx={{ borderRadius: '6px', textTransform: 'none' }}>
            + Add Micromarkets
          </Button>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: '8px', px: 3 }}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            const valid = names.map((x) => x.trim()).filter(Boolean);
            if (valid.length) {
              onSubmit(valid);
              onClose();
            }
          }}
          variant="contained"
          sx={{ bgcolor: '#1A237E', borderRadius: '8px', px: 3 }}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function AddLocalityDialog({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (items: { localityName: string; pincode: string }[]) => void;
}) {
  const [items, setItems] = useState([{ localityName: 'Senapati Bapat Road', pincode: '411045' }]);
  const [region] = useState('Central Pune');
  const [micro] = useState('Shivajinagar');
  useEffect(() => {
    if (open) setItems([{ localityName: 'Senapati Bapat Road', pincode: '411045' }]);
  }, [open]);
  const add = () => setItems([...items, { localityName: '', pincode: '' }]);
  const remove = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const change = (i: number, field: 'localityName' | 'pincode', v: string) => {
    const n = [...items];
    (n[i] as any)[field] = v;
    setItems(n);
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Pincode/Locality
        <IconButton onClick={onClose}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
          <TextField label="Region" value={region} InputProps={{ readOnly: true }} size="small" InputLabelProps={{ shrink: true }} />
          <TextField label="Micromarket" value={micro} InputProps={{ readOnly: true }} size="small" InputLabelProps={{ shrink: true }} />
        </Box>
        {items.map((it, i) => (
          <Box key={i} sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 1.5, mb: 1.5, alignItems: 'center' }}>
            <TextField
              placeholder="Enter Locality Name"
              value={it.localityName}
              onChange={(e) => change(i, 'localityName', e.target.value)}
              size="small"
            />
            <TextField
              placeholder="Enter Pincode"
              value={it.pincode}
              onChange={(e) => change(i, 'pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
              size="small"
            />
            <IconButton color="error" onClick={() => remove(i)}>
              <Iconify icon="solar:minus-circle-bold" width={20} />
            </IconButton>
          </Box>
        ))}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
          <Button variant="outlined" size="small" onClick={add} sx={{ borderRadius: '6px', textTransform: 'none' }}>
            + Add Pincode/Locality
          </Button>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: '8px', px: 3 }}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            const valid = items.filter((x) => x.localityName.trim() && /^\d{6}$/.test(x.pincode));
            if (valid.length) {
              onSubmit(valid);
              onClose();
            }
          }}
          variant="contained"
          sx={{ bgcolor: '#1A237E', borderRadius: '8px', px: 3 }}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}

type LocalityItem = { localityName: string; pincode: string };
type MicroItem = { micromarketName: string; localities: LocalityItem[] };
type RegionItem = { regionName: string; micromarkets: MicroItem[] };

export default function LaCityFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const cityId = id ? Number(id) : undefined;

  const { data: cityData, isLoading: isFetching } = useLaCityById(cityId ?? 0);
  const { mutateAsync: createCity, isPending: isCreating } = useCreateLaCity();
  const { mutateAsync: updateCity, isPending: isUpdating } = useUpdateLaCity();
  const { data: zonesResponse } = useZoneList();
  const zones: any[] = (zonesResponse as any)?.data ?? (Array.isArray(zonesResponse) ? zonesResponse : []);
  const saving = isCreating || isUpdating;

  const [activeStep, setActiveStep] = useState(0);
  const [cityName, setCityName] = useState('');
  const [businessZoneId, setBusinessZoneId] = useState<number | ''>('');
  const [regions, setRegions] = useState<RegionItem[]>([
    { regionName: 'Central Pune', micromarkets: [{ micromarketName: 'Shivajinagar', localities: [{ localityName: 'Shivajinagar', pincode: '411005' }, { localityName: 'Model Colony', pincode: '411004' }, { localityName: 'Senapati Bapat Road', pincode: '411016' }, { localityName: 'Bopodi', pincode: '411007' }, { localityName: 'Khadki', pincode: '411020' }] }] },
    { regionName: 'South Pune', micromarkets: [] },
    { regionName: 'North Pune', micromarkets: [] },
  ]);
  const [selectedRegionIdx, setSelectedRegionIdx] = useState(0);
  const [selectedMicroIdx, setSelectedMicroIdx] = useState(0);
  const [regionSearch, setRegionSearch] = useState('');
  const [microSearch, setMicroSearch] = useState('');
  const [localitySearch, setLocalitySearch] = useState('');
  const [showRegionDlg, setShowRegionDlg] = useState(false);
  const [showMicroDlg, setShowMicroDlg] = useState(false);
  const [showLocalityDlg, setShowLocalityDlg] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [approvals, setApprovals] = useState<Record<string, string[]>>({});

  const selectedRegion = regions[selectedRegionIdx] ?? regions[0];
  const selectedMicro = selectedRegion?.micromarkets[selectedMicroIdx] ?? selectedRegion?.micromarkets[0];
  const filteredRegions = regions.filter((r) => r.regionName.toLowerCase().includes(regionSearch.toLowerCase()));
  const filteredMicros = (selectedRegion?.micromarkets ?? []).filter((m) => m.micromarketName.toLowerCase().includes(microSearch.toLowerCase()));
  const filteredLocalities = (selectedMicro?.localities ?? []).filter(
    (l) => l.localityName.toLowerCase().includes(localitySearch.toLowerCase()) || l.pincode.includes(localitySearch)
  );

  useEffect(() => {
    if (cityData) {
      const d: any = (cityData as any).data ?? cityData;
      setCityName(d.cityName || '');
      setBusinessZoneId(d.businessZoneId || '');
      if (d.regions?.length) {
        setRegions(
          d.regions.map((r: any) => ({
            regionName: r.regionName,
            micromarkets: (r.micromarkets ?? []).map((m: any) => ({
              micromarketName: m.micromarketName,
              localities: (m.localities ?? []).map((l: any) => ({ localityName: l.localityName, pincode: l.pincode })),
            })),
          }))
        );
      }
      if (d.approvals?.length) {
        const map: Record<string, string[]> = {};
        d.approvals.forEach((a: any) => {
          map[a.genericApproval] = a.governingBodies ?? [];
        });
        setApprovals(map);
      }
    }
  }, [cityData]);

  const validateStep0 = useCallback(() => {
    const e: Record<string, string> = {};
    if (!cityName.trim()) e.cityName = 'City Name is required';
    if (!businessZoneId) e.businessZoneId = 'Business Zone is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [cityName, businessZoneId]);

  const handleNext = useCallback(() => {
    if (activeStep === 0 && !validateStep0()) return;
    setActiveStep((s) => Math.min(s + 1, 1));
  }, [activeStep, validateStep0]);

  const handleSave = useCallback(async () => {
    if (!validateStep0()) {
      setActiveStep(0);
      return;
    }
    const payload: any = {
      cityName: cityName.trim(),
      businessZoneId: Number(businessZoneId),
      regions: regions.map((r) => ({
        regionName: r.regionName,
        micromarkets: r.micromarkets.map((m) => ({
          micromarketName: m.micromarketName,
          localities: m.localities.map((l) => ({ localityName: l.localityName, pincode: l.pincode })),
        })),
      })),
      approvals: GENERIC_APPROVALS.map((name) => ({
        genericApproval: name,
        governingBodies: approvals[name] ?? [],
        documents: [],
      })).filter((a) => a.governingBodies.length > 0),
    };
    try {
      if (isEdit && cityId) await updateCity({ id: cityId, data: payload });
      else await createCity(payload);
      setShowSuccess(true);
      setTimeout(() => navigate('/dashboard/la-cities'), 1200);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to save';
      setErrors((p) => ({ ...p, submit: Array.isArray(msg) ? msg.join(', ') : String(msg) }));
    }
  }, [validateStep0, cityName, businessZoneId, regions, approvals, isEdit, cityId, createCity, updateCity, navigate]);

  if (isEdit && isFetching) {
    return (
      <Box sx={{ p: 4 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <>
      <Helmet>
        <title>{isEdit ? 'Edit City' : 'Add City'} - {CONFIG.appName}</title>
      </Helmet>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
          {isEdit ? 'Edit City' : 'Add City'}
        </Typography>

        <Card sx={{ p: 4, borderRadius: '16px', mb: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {STEPS.map((label, idx) => (
              <Step key={label}>
                <StepLabel
                  StepIconProps={{
                    sx: {
                      '&.Mui-completed': { color: '#1A237E' },
                      '&.Mui-active': { color: '#1A237E' },
                    },
                  }}
                >
                  <Typography variant="body2" fontWeight={activeStep === idx ? 700 : 400} color={activeStep === idx ? '#1A237E' : 'text.secondary'}>
                    {label}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 && (
            <>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                City Details
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5, mb: 3 }}>
                <TextField
                  label="City Name"
                  placeholder="Enter City Name"
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                  error={!!errors.cityName}
                  helperText={errors.cityName}
                  required
                  InputLabelProps={{ shrink: true }}
                />
                <Autocomplete
                  options={zones}
                  getOptionLabel={(o: any) => o.name}
                  value={zones.find((z) => z.id === businessZoneId) || null}
                  onChange={(_, v: any) => setBusinessZoneId(v?.id || '')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Business Zone"
                      placeholder="Select Business Zone"
                      error={!!errors.businessZoneId}
                      helperText={errors.businessZoneId}
                      required
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Box>

              <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Geo Mapping
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                {/* Regions */}
                <Box sx={{ border: '1px solid #E8EAF0', borderRadius: '8px', overflow: 'hidden' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, borderBottom: '1px solid #E8EAF0' }}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      Regions ({regions.length})
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Iconify icon="mingcute:add-line" width={14} />}
                      onClick={() => setShowRegionDlg(true)}
                      sx={{ borderRadius: '6px', textTransform: 'none', fontSize: '0.75rem' }}
                    >
                      Add Region
                    </Button>
                  </Box>
                  <Box sx={{ p: 1 }}>
                    <TextField
                      placeholder="Search regions"
                      value={regionSearch}
                      onChange={(e) => setRegionSearch(e.target.value)}
                      size="small"
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Iconify icon="solar:magnifer-bold" width={16} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                  <Box sx={{ maxHeight: 280, overflow: 'auto' }}>
                    {filteredRegions.map((r, idx) => {
                      const realIdx = regions.findIndex((x) => x.regionName === r.regionName);
                      const selected = realIdx === selectedRegionIdx;
                      return (
                        <Box
                          key={r.regionName}
                          onClick={() => {
                            setSelectedRegionIdx(realIdx);
                            setSelectedMicroIdx(0);
                          }}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            p: 1.2,
                            mx: 1,
                            mb: 0.5,
                            borderRadius: '6px',
                            bgcolor: selected ? '#EEF2FF' : 'transparent',
                            cursor: 'pointer',
                            '&:hover': { bgcolor: '#F8F9FC' },
                          }}
                        >
                          <Radio checked={selected} size="small" sx={{ p: 0, color: '#1A237E', '&.Mui-checked': { color: '#1A237E' } }} />
                          <Typography variant="body2" fontWeight={selected ? 600 : 400} color={selected ? '#1A237E' : 'text.primary'}>
                            {r.regionName}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>

                {/* Micromarkets */}
                <Box sx={{ border: '1px solid #E8EAF0', borderRadius: '8px', overflow: 'hidden' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, borderBottom: '1px solid #E8EAF0' }}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      Micromarkets
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Iconify icon="mingcute:add-line" width={14} />}
                      onClick={() => setShowMicroDlg(true)}
                      sx={{ borderRadius: '6px', textTransform: 'none', fontSize: '0.75rem' }}
                      disabled={!selectedRegion}
                    >
                      Add micromarket
                    </Button>
                  </Box>
                  <Box sx={{ p: 1 }}>
                    <TextField
                      placeholder="Search micromarkets"
                      value={microSearch}
                      onChange={(e) => setMicroSearch(e.target.value)}
                      size="small"
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Iconify icon="solar:magnifer-bold" width={16} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                  {selectedRegion && (
                    <Box sx={{ px: 1, pb: 1 }}>
                      <Typography variant="caption" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <Iconify icon="solar:alt-arrow-right-bold" width={12} /> {selectedRegion.regionName}
                      </Typography>
                      {filteredMicros.length === 0 && (
                        <Typography variant="body2" color="text.disabled" sx={{ p: 2, textAlign: 'center' }}>
                          No micromarkets
                        </Typography>
                      )}
                      {filteredMicros.map((m) => {
                        const realIdx = selectedRegion.micromarkets.findIndex((x) => x.micromarketName === m.micromarketName);
                        const sel = realIdx === selectedMicroIdx;
                        return (
                          <Box
                            key={m.micromarketName}
                            onClick={() => setSelectedMicroIdx(realIdx)}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              p: 1,
                              mb: 0.5,
                              borderRadius: '6px',
                              bgcolor: sel ? '#EEF2FF' : 'transparent',
                              cursor: 'pointer',
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Radio checked={sel} size="small" sx={{ p: 0, color: '#1A237E', '&.Mui-checked': { color: '#1A237E' } }} />
                              <Typography variant="body2" fontWeight={sel ? 600 : 400}>
                                {m.micromarketName}
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              {m.localities.length} Localities
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </Box>

                {/* Pincode/Locality */}
                <Box sx={{ border: '1px solid #E8EAF0', borderRadius: '8px', overflow: 'hidden' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, borderBottom: '1px solid #E8EAF0' }}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      Pincode/Locality
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Iconify icon="mingcute:add-line" width={14} />}
                      onClick={() => setShowLocalityDlg(true)}
                      sx={{ borderRadius: '6px', textTransform: 'none', fontSize: '0.75rem' }}
                      disabled={!selectedMicro}
                    >
                      Add Locality
                    </Button>
                  </Box>
                  <Box sx={{ p: 1 }}>
                    <TextField
                      placeholder="Search locality/pincode"
                      value={localitySearch}
                      onChange={(e) => setLocalitySearch(e.target.value)}
                      size="small"
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Iconify icon="solar:magnifer-bold" width={16} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                  {selectedMicro && (
                    <Box>
                      <Box sx={{ display: 'flex', gap: 1, px: 1.5, py: 1, bgcolor: '#F8F9FC', borderY: '1px solid #E8EAF0' }}>
                        <Typography variant="caption" color="text.secondary">
                          {selectedRegion.regionName}
                        </Typography>
                        <Typography variant="caption">›</Typography>
                        <Typography variant="caption" color="primary" fontWeight={600}>
                          {selectedMicro.micromarketName}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto', px: 1.5, py: 1, bgcolor: '#F8F9FC' }}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary">
                          Locality
                        </Typography>
                        <Typography variant="caption" fontWeight={700} color="text.secondary">
                          Pincode
                        </Typography>
                      </Box>
                      <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                        {filteredLocalities.map((l) => (
                          <Box
                            key={`${l.localityName}-${l.pincode}`}
                            sx={{
                              display: 'grid',
                              gridTemplateColumns: '1fr auto',
                              px: 1.5,
                              py: 1,
                              borderBottom: '1px dashed #E8EAF0',
                            }}
                          >
                            <Typography variant="body2">{l.localityName}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {l.pincode}
                            </Typography>
                          </Box>
                        ))}
                        {filteredLocalities.length === 0 && (
                          <Typography variant="body2" color="text.disabled" sx={{ p: 2, textAlign: 'center' }}>
                            No localities
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 3 }}>
                <Button variant="outlined" onClick={() => navigate('/dashboard/la-cities')} sx={{ borderRadius: '8px', px: 3 }}>
                  Cancel
                </Button>
                <Button variant="contained" onClick={handleNext} sx={{ bgcolor: '#1A237E', borderRadius: '8px', px: 3 }}>
                  Save & Next
                </Button>
              </Box>
            </>
          )}

          {activeStep === 1 && (
            <>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Approvals & Department Mapping
              </Typography>
              <Box sx={{ border: '1px solid #E8EAF0', borderRadius: '8px', overflow: 'hidden' }}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 2fr 1fr auto',
                    gap: 2,
                    p: 1.5,
                    bgcolor: '#F8F9FC',
                    borderBottom: '1px solid #E8EAF0',
                  }}
                >
                  <Typography variant="caption" fontWeight={700} color="text.secondary">
                    Generic Approval
                  </Typography>
                  <Typography variant="caption" fontWeight={700} color="text.secondary">
                    Governing Body
                  </Typography>
                  <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textAlign: 'center' }}>
                    Documents
                  </Typography>
                  <Typography variant="caption" fontWeight={700} color="text.secondary">
                    Actions
                  </Typography>
                </Box>
                {GENERIC_APPROVALS.map((name) => (
                  <Box
                    key={name}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 2fr 1fr auto',
                      gap: 2,
                      p: 1.5,
                      alignItems: 'center',
                      borderBottom: '1px dashed #E8EAF0',
                    }}
                  >
                    <Typography variant="body2">{name}</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(approvals[name] ?? []).length ? (
                        (approvals[name] ?? []).map((g) => (
                          <Chip key={g} label={g} size="small" sx={{ bgcolor: '#1A237E', color: 'white', height: 24, fontSize: '0.7rem' }} />
                        ))
                      ) : (
                        <Typography variant="caption" color="text.disabled">
                          -
                        </Typography>
                      )}
                    </Box>
                    <Typography variant="body2" sx={{ textAlign: 'center' }}>
                      -
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Iconify icon="solar:settings-bold" width={14} />}
                      onClick={() => {
                        const val = prompt(`Governing bodies for "${name}" (comma separated, e.g. PMRDA, PMC DP)`, (approvals[name] ?? []).join(', '));
                        if (val !== null) {
                          const list = val
                            .split(',')
                            .map((x) => x.trim())
                            .filter(Boolean);
                          setApprovals((prev) => ({ ...prev, [name]: list }));
                        }
                      }}
                      sx={{ borderRadius: '6px', textTransform: 'none', fontSize: '0.75rem' }}
                    >
                      Configure
                    </Button>
                  </Box>
                ))}
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 3 }}>
                <Button variant="outlined" onClick={() => setActiveStep(0)} sx={{ borderRadius: '8px', px: 3 }}>
                  Back
                </Button>
                <Button variant="outlined" onClick={() => navigate('/dashboard/la-cities')} sx={{ borderRadius: '8px', px: 3 }}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={saving}
                  sx={{ bgcolor: '#1A237E', borderRadius: '8px', px: 3 }}
                >
                  {saving ? 'Saving...' : 'Create'}
                </Button>
              </Box>
            </>
          )}

          {errors.submit && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errors.submit}
            </Alert>
          )}
          {saving && <LinearProgress sx={{ mt: 2 }} />}
        </Card>
      </Box>

      <AddRegionDialog
        open={showRegionDlg}
        onClose={() => setShowRegionDlg(false)}
        onSubmit={(name) => {
          setRegions([...regions, { regionName: name, micromarkets: [] }]);
        }}
      />
      <AddMicromarketDialog
        open={showMicroDlg}
        onClose={() => setShowMicroDlg(false)}
        onSubmit={(names) => {
          const updated = [...regions];
          const idx = selectedRegionIdx;
          const micros = names.map((n) => ({ micromarketName: n, localities: [] as LocalityItem[] }));
          updated[idx] = { ...updated[idx], micromarkets: [...updated[idx].micromarkets, ...micros] };
          setRegions(updated);
        }}
      />
      <AddLocalityDialog
        open={showLocalityDlg}
        onClose={() => setShowLocalityDlg(false)}
        onSubmit={(items) => {
          const updated = [...regions];
          const rIdx = selectedRegionIdx;
          const mIdx = selectedMicroIdx;
          const micro = updated[rIdx].micromarkets[mIdx];
          updated[rIdx].micromarkets[mIdx] = { ...micro, localities: [...micro.localities, ...items] };
          setRegions(updated);
        }}
      />

      <Snackbar open={showSuccess} autoHideDuration={2000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" variant="filled">
          City {isEdit ? 'updated' : 'created'} successfully
        </Alert>
      </Snackbar>
    </>
  );
}
