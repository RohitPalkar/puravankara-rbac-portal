import type { DepartmentDetail, CheckDepartmentNameResult, DepartmentHierarchyLevelInput } from 'src/services/types/organization';

import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Autocomplete from '@mui/material/Autocomplete';
import LinearProgress from '@mui/material/LinearProgress';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { queryKeys } from 'src/services/api/query-keys';
import { userService } from 'src/services/services/user.service';
import { useMyPermissions } from 'src/services/hooks/use-permissions';
import { zoneService } from 'src/services/services/geography.service';
import { departmentService } from 'src/services/services/organization.service';
import { useLevelRemove, useDepartmentById, useCreateDepartment, useUpdateDepartment } from 'src/services/hooks/use-organization';

import { Iconify } from 'src/components/iconify';
import { PageHeader, PageContainer } from 'src/components/page-layout';
import { DeleteLevelDialog } from 'src/components/delete-level-dialog';

const DEBOUNCE_MS = 400;

function hasDepartmentPermission(
  permissions: { projects: { modules: { subModules: { name: string; actions: { code: string; allowed: boolean }[] }[] }[] }[] } | undefined,
  action: string
): boolean {
  if (!permissions) return false;
  return permissions.projects.some((project) =>
    project.modules.some((mod) =>
      mod.subModules.some((sub) =>
        sub.name === 'DEPARTMENTS' && sub.actions.some((a) => a.code === action && a.allowed)
      )
    )
  );
}

function sanitizeNumericInput(value: string): string {
  return value.replace(/[^0-9]/g, '');
}

export default function DepartmentFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const departmentId = id ? Number(id) : undefined;

  const { data: permissions } = useMyPermissions();
  const canCreate = useMemo(() => hasDepartmentPermission(permissions, 'CREATE'), [permissions]);
  const canEdit = useMemo(() => hasDepartmentPermission(permissions, 'EDIT'), [permissions]);

  const { data: deptData, isLoading: isFetching, isError: isFetchError } = useDepartmentById(departmentId ?? 0);
  const { mutateAsync: createDepartment, isPending: isCreating } = useCreateDepartment();
  const { mutateAsync: updateDepartment, isPending: isUpdating } = useUpdateDepartment();

  const { data: zones } = useQuery({
    queryKey: queryKeys.zones.list({}),
    queryFn: async () => {
      const res = await zoneService.list({});
      return (res.data ?? []) as any[];
    },
  });

  const { data: users } = useQuery({
    queryKey: queryKeys.users.list({}),
    queryFn: async () => {
      const res = await userService.list({});
      return (res.data ?? []) as any[];
    },
  });

  const activeUsers = useMemo(
    () => (users ?? []).filter((u: any) => u.isActive),
    [users],
  );

  const activeZones = useMemo(
    () => (zones ?? [])
      .filter((z: any) => z.isActive !== false)
      .sort((a: any, b: any) => a.name.localeCompare(b.name))
      .map((z: any) => ({ id: z.id, name: z.name })),
    [zones],
  );

  const [name, setName] = useState('');
  const [numberOfLevels, setNumberOfLevels] = useState<number>(3);
  const [levelsInputValue, setLevelsInputValue] = useState('3');
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  const [departmentAdminId, setDepartmentAdminId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [hierarchyLevels, setHierarchyLevels] = useState<DepartmentHierarchyLevelInput[]>([]);
  const [levelsGenerated, setLevelsGenerated] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [nameError, setNameError] = useState('');
  const [zoneError, setZoneError] = useState('');
  const [adminError, setAdminError] = useState('');
  const [levelsError, setLevelsError] = useState('');
  const [hierarchyErrors, setHierarchyErrors] = useState<Record<number, string>>({});

  const [nameValidation, setNameValidation] = useState<{
    state: 'idle' | 'checking' | 'available' | 'unavailable';
    message: string;
    existingInZones?: { zoneId: number; zoneName: string }[];
  }>({ state: 'idle', message: '' });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saving = isCreating || isUpdating;
  const { mutateAsync: removeLevel, isPending: isRemovingLevel } = useLevelRemove();

  const [deleteLevel, setDeleteLevel] = useState<{ levelNumber: number; roleName: string } | null>(null);

  const formDisabled = levelsGenerated;

  const zoneSelected = selectedZoneId !== null;
  const nameValid = name.trim().length > 0;
  const canGenerate = zoneSelected && nameValid && nameValidation.state !== 'unavailable';

  const selectedZoneName = useMemo(
    () => activeZones.find((z: any) => z.id === selectedZoneId)?.name ?? '',
    [activeZones, selectedZoneId],
  );

  const doCheckName = useCallback(async (checkName: string, checkZoneId: number, excludeId?: number) => {
    if (!checkName.trim() || !checkZoneId) {
      setNameValidation({ state: 'idle', message: '' });
      return;
    }
    setNameValidation({ state: 'checking', message: '' });
    try {
      const res = await departmentService.checkName(checkName.trim(), checkZoneId, excludeId);
      const result = res.data as CheckDepartmentNameResult;
      if (result.available) {
        setNameValidation({ state: 'available', message: '' });
        setNameError('');
      } else {
        setNameValidation({ state: 'unavailable', message: result.message ?? '' });
        if (result.existingInZones && result.existingInZones.length > 0) {
          setNameValidation((prev) => ({ ...prev, existingInZones: result.existingInZones }));
        }
      }
    } catch {
      setNameValidation({ state: 'idle', message: '' });
    }
  }, []);

  const triggerValidation = useCallback((val: string, zone: number | null) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim() || !zone) {
      setNameValidation({ state: 'idle', message: '' });
      return;
    }
    debounceRef.current = setTimeout(() => {
      doCheckName(val, zone, departmentId);
    }, DEBOUNCE_MS);
  }, [doCheckName, departmentId]);

  useEffect(() => {
    if (deptData) {
      const d = deptData as unknown as DepartmentDetail;
      setName(d.name);
      setNumberOfLevels(d.maxHierarchyLevels);
      setLevelsInputValue(String(d.maxHierarchyLevels));
      setIsActive(d.isActive);
      setDepartmentAdminId(d.departmentAdminId);
      setSelectedZoneId(d.zoneId ?? null);

      if (d.hierarchyLevels && d.hierarchyLevels.length > 0) {
        const sorted = [...d.hierarchyLevels].sort((a, b) => a.displayOrder - b.displayOrder);
        setHierarchyLevels(
          sorted.map((hl) => ({
            levelNumber: hl.levelNumber,
            roleName: hl.roleName,
            displayOrder: hl.displayOrder,
          })),
        );
        setLevelsGenerated(true);
      }
    }
  }, [deptData]);

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  const handleLevelsChange = useCallback((raw: string) => {
    const sanitized = sanitizeNumericInput(raw);
    setLevelsInputValue(sanitized || '');
    const num = parseInt(sanitized, 10);
    if (!Number.isNaN(num) && num >= 1 && num <= 20) {
      setNumberOfLevels(num);
      setLevelsError('');
    } else if (sanitized === '' || sanitized === '0') {
      setNumberOfLevels(0);
    } else if (!Number.isNaN(num) && num > 20) {
      setLevelsError('Maximum 20 hierarchy levels are allowed.');
    }
  }, []);

  const handleLevelsBlur = useCallback(() => {
    const num = parseInt(levelsInputValue, 10);
    if (!Number.isNaN(num) && (num < 1 || num > 20)) {
      setLevelsInputValue(String(numberOfLevels));
      if (num > 20) {
        setLevelsError('Maximum 20 hierarchy levels are allowed.');
      } else {
        setLevelsError('Minimum 1 hierarchy level is required.');
      }
    }
  }, [levelsInputValue, numberOfLevels]);

  const handleGenerateHierarchy = useCallback(() => {
    const count = numberOfLevels;
    if (count < 1 || count > 20) {
      setLevelsError('Maximum 20 hierarchy levels are allowed.');
      return;
    }
    setLevelsError('');

    const existing = [...hierarchyLevels];
    const generated: DepartmentHierarchyLevelInput[] = [];
    for (let i = 1; i <= count; i += 1) {
      const existingItem = existing.find((e) => e.levelNumber === i);
      generated.push({
        levelNumber: i,
        roleName: existingItem?.roleName ?? '',
        displayOrder: i,
      });
    }
    setHierarchyLevels(generated);
    setLevelsGenerated(true);
  }, [numberOfLevels, hierarchyLevels]);

  const handleRoleNameChange = useCallback((levelNumber: number, roleName: string) => {
    setHierarchyLevels((prev) =>
      prev.map((hl) => (hl.levelNumber === levelNumber ? { ...hl, roleName } : hl)),
    );
    setHierarchyErrors((prev) => {
      const next = { ...prev };
      delete next[levelNumber];
      return next;
    });
  }, []);

  const validate = useCallback((): boolean => {
    let valid = true;

    if (!name.trim()) {
      setNameError('Department name is required');
      valid = false;
    } else if (nameValidation.state === 'unavailable') {
      setNameError(nameValidation.message || 'This name is already taken in the selected zone');
      valid = false;
    } else {
      setNameError('');
    }

    if (selectedZoneId === null) {
      setZoneError('Zone is required');
      valid = false;
    } else {
      setZoneError('');
    }

    if (!departmentAdminId) {
      setAdminError('Department admin is required');
      valid = false;
    } else {
      setAdminError('');
    }

    if (numberOfLevels < 1 || numberOfLevels > 20 || !Number.isInteger(numberOfLevels)) {
      setLevelsError('Maximum 20 hierarchy levels are allowed.');
      valid = false;
    } else {
      setLevelsError('');
    }

    if (!levelsGenerated || hierarchyLevels.length === 0) {
      setLevelsError('Click "Generate Hierarchy Levels" before saving');
      valid = false;
    } else if (hierarchyLevels.length !== numberOfLevels) {
      setLevelsError(`Expected ${numberOfLevels} levels, but ${hierarchyLevels.length} generated`);
      valid = false;
    } else {
      setLevelsError('');
    }

    const newHierarchyErrors: Record<number, string> = {};
    hierarchyLevels.forEach((hl) => {
      if (!hl.roleName.trim()) {
        newHierarchyErrors[hl.levelNumber] = 'Role name is required';
        valid = false;
      }
    });
    setHierarchyErrors(newHierarchyErrors);

    return valid;
  }, [name, nameValidation, selectedZoneId, departmentAdminId, numberOfLevels, levelsGenerated, hierarchyLevels]);

  const handleRemoveLevel = useCallback(async (payload: { mode: 'MERGE' | 'REPLACE'; destinationLevelNumber: number }) => {
    if (!deleteLevel || !departmentId) return;
    try {
      await removeLevel({ departmentId, levelNumber: deleteLevel.levelNumber, payload });
      setDeleteLevel(null);
    } catch {
      // error handled by mutation
    }
  }, [deleteLevel, departmentId, removeLevel]);

  const handleSave = useCallback(async () => {
    if (!validate()) return;
    setSaveError('');

    try {
      if (isEdit && departmentId) {
        await updateDepartment({
          id: departmentId,
          data: {
            name: name.trim(),
            numberOfLevels,
            departmentAdminId: departmentAdminId ?? undefined,
            zoneId: selectedZoneId!,
            hierarchyLevels,
            isActive,
          },
        });
        setSuccessMessage(`${name.trim()} has been updated successfully.`);
      } else {
        await createDepartment({
          name: name.trim(),
          numberOfLevels,
          departmentAdminId: departmentAdminId ?? undefined,
          zoneId: selectedZoneId!,
          hierarchyLevels,
          isActive: true,
        });
        setSuccessMessage(`${name.trim()} has been created successfully for ${selectedZoneName} Zone.`);
      }
      setShowSuccess(true);
      setTimeout(() => navigate(paths.dashboard.departmentMaster), 1500);
    } catch (err: any) {
      const msg = err?.response?.data?.message?.[0] || err?.message || 'Failed to save department';
      setSaveError(msg);
    }
  }, [isEdit, departmentId, name, numberOfLevels, departmentAdminId, selectedZoneId, selectedZoneName, hierarchyLevels, isActive, validate, createDepartment, updateDepartment, navigate]);

  if (isEdit && isFetching) {
    return (
      <PageContainer>
        <PageHeader title="Edit Department" />
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

  if (isEdit && (isFetchError || (!isFetching && !deptData))) {
    return (
      <PageContainer>
        <PageHeader title="Department Not Found" description="The requested department does not exist" />
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">Department with ID &quot;{id}&quot; not found.</Typography>
          <Button onClick={() => navigate(paths.dashboard.departmentMaster)} sx={{ mt: 2 }}>Back to Departments</Button>
        </Card>
      </PageContainer>
    );
  }

  if (isEdit && !canEdit) {
    return (
      <PageContainer>
        <PageHeader title="Access Denied" />
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="error">You do not have permission to edit departments.</Typography>
          <Button onClick={() => navigate(paths.dashboard.departmentMaster)} sx={{ mt: 2 }}>Back to Departments</Button>
        </Card>
      </PageContainer>
    );
  }

  if (!isEdit && !canCreate) {
    return (
      <PageContainer>
        <PageHeader title="Access Denied" />
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="error">You do not have permission to create departments.</Typography>
          <Button onClick={() => navigate(paths.dashboard.departmentMaster)} sx={{ mt: 2 }}>Back to Departments</Button>
        </Card>
      </PageContainer>
    );
  }

  return (
    <>
      <Helmet><title>{isEdit ? 'Edit Department' : 'Create Department'} - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader
          title={isEdit ? 'Edit Department' : 'Create Department'}
          description={isEdit ? 'Update department details' : 'Add a new organizational department'}
        />

        {saving && <LinearProgress />}

        {saveError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSaveError('')}>
            {saveError}
          </Alert>
        )}

        <Card sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="subtitle1">Department Information</Typography>
            {formDisabled && (
              <Button variant="text" size="small" onClick={() => setLevelsGenerated(false)}>
                Edit
              </Button>
            )}
          </Box>

          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={3}>
            <Autocomplete
              options={activeZones}
              getOptionLabel={(option) => option.name}
              value={activeZones.find((z: any) => z.id === selectedZoneId) ?? null}
              onChange={(_, newValue) => {
                const newZoneId = newValue ? (newValue as any).id : null;
                setSelectedZoneId(newZoneId);
                setZoneError('');
                if (name.trim()) {
                  triggerValidation(name, newZoneId);
                }
              }}
              disabled={formDisabled}
              noOptionsText={
                <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                  No active Zones found.<br />
                  Create a Zone first.
                </Typography>
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Zone *"
                  placeholder="Search zone..."
                  error={!!zoneError}
                  helperText={zoneError}
                  inputProps={{
                    ...params.inputProps,
                    'aria-label': 'Zone selection',
                  }}
                />
              )}
              componentsProps={{
                popper: {
                  sx: { zIndex: 1300 },
                },
              }}
            />
            <TextField
              label="Department Name *"
              value={name}
              onChange={(e) => {
                const val = e.target.value;
                setName(val);
                setNameError('');
                triggerValidation(val, selectedZoneId);
              }}
              error={!!nameError || nameValidation.state === 'unavailable'}
              helperText={
                (nameValidation.state === 'checking' ? 'Checking availability...' : '') ||
                nameError ||
                (nameValidation.state === 'available' ? 'Name is available' : '')
              }
              InputProps={{
                endAdornment: nameValidation.state === 'checking' ? (
                  <InputAdornment position="end">
                    <CircularProgress size={18} />
                  </InputAdornment>
                ) : nameValidation.state === 'unavailable' ? (
                  <InputAdornment position="end">
                    <Iconify icon="solar:close-circle-bold" width={20} sx={{ color: 'error.main' }} />
                  </InputAdornment>
                ) : nameValidation.state === 'available' ? (
                  <InputAdornment position="end">
                    <Iconify icon="solar:check-circle-bold" width={20} sx={{ color: 'success.main' }} />
                  </InputAdornment>
                ) : null,
              }}
              required
              disabled={formDisabled}
            />
          </Box>

          {nameValidation.state === 'unavailable' && nameValidation.existingInZones && nameValidation.existingInZones.length > 0 && (
            <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold" width={20} />} sx={{ mt: 2 }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                &ldquo;{name}&rdquo; already exists in the following Zones:
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2.5, '& li': { mb: 0.25 } }}>
                {nameValidation.existingInZones.map((z) => (
                  <li key={z.zoneId}>
                    <Typography variant="body2">{z.zoneName}</Typography>
                  </li>
                ))}
              </Box>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Creating &ldquo;{name}&rdquo; in &ldquo;{selectedZoneName}&rdquo; will create a separate Department.
              </Typography>
            </Alert>
          )}

          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={3}>
            <TextField
              label="No. of Levels *"
              type="text"
              inputMode="numeric"
              placeholder="Enter number of levels"
              value={levelsInputValue}
              onChange={(e) => handleLevelsChange(e.target.value)}
              onBlur={handleLevelsBlur}
              disabled={formDisabled}
              error={!!levelsError}
              helperText={levelsError}
              required
              sx={{
                '& input[type="text"]::-webkit-outer-spin-button': { display: 'none' },
                '& input[type="text"]::-webkit-inner-spin-button': { display: 'none' },
              }}
            />
            <Autocomplete
              options={activeUsers}
              getOptionLabel={(option: any) => `${option.name} (${option.empId})`}
              value={activeUsers.find((u: any) => u.empId === departmentAdminId) ?? null}
              onChange={(_, newValue) => {
                setDepartmentAdminId(newValue ? (newValue as any).empId : null);
                setAdminError('');
              }}
              disabled={formDisabled}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Department Admin *"
                  placeholder="Select admin"
                  error={!!adminError}
                  helperText={adminError}
                />
              )}
            />
          </Box>

          {isEdit && (
            <Box sx={{ mt: 3 }}>
              <TextField
                select
                label="Status"
                value={isActive ? 'active' : 'inactive'}
                onChange={(e) => setIsActive(e.target.value === 'active')}
                sx={{ width: 300 }}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
            </Box>
          )}

          {!levelsGenerated && (
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button
                variant="contained"
                onClick={handleGenerateHierarchy}
                disabled={!canGenerate}
                sx={{ minWidth: 280 }}
              >
                Generate Hierarchy Levels
              </Button>
            </Box>
          )}
        </Card>

        {levelsGenerated && hierarchyLevels.length > 0 && (
          <Card sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="subtitle1">Role Hierarchy</Typography>
              <Button
                variant="text"
                size="small"
                onClick={() => setLevelsGenerated(false)}
              >
                Edit
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {hierarchyLevels.map((hl) => (
                <Box key={hl.levelNumber} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography
                    variant="body1"
                    sx={{ minWidth: 72, fontWeight: 500, color: 'text.secondary' }}
                  >
                    Level {hl.levelNumber}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.disabled', minWidth: 24 }}>
                    &gt;&gt;
                  </Typography>
                  <TextField
                    placeholder="Enter Role Name"
                    value={hl.roleName}
                    onChange={(e) => handleRoleNameChange(hl.levelNumber, e.target.value)}
                    error={!!hierarchyErrors[hl.levelNumber]}
                    helperText={hierarchyErrors[hl.levelNumber]}
                    size="small"
                    sx={{ flex: 1 }}
                  />
                  {isEdit && (
                    <Tooltip title="Remove this level">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteLevel({ levelNumber: hl.levelNumber, roleName: hl.roleName })}
                      >
                        <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              ))}
            </Box>
          </Card>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, py: 2 }}>
          <Button variant="outlined" onClick={() => navigate(paths.dashboard.departmentMaster)} size="large">
            Cancel
          </Button>
          <Button variant="contained" startIcon={<Iconify icon="solar:check-circle-bold" />} onClick={handleSave} disabled={saving} size="large">
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </Box>
      </PageContainer>

      <DeleteLevelDialog
        open={deleteLevel !== null}
        departmentId={departmentId ?? null}
        levelNumber={deleteLevel?.levelNumber ?? null}
        levelName={deleteLevel?.roleName ?? ''}
        onClose={() => setDeleteLevel(null)}
        onConfirm={handleRemoveLevel}
        loading={isRemovingLevel}
      />

      <Snackbar open={showSuccess} autoHideDuration={2500} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" sx={{ width: 1 }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </>
  );
}