import type { HierarchyLevel, DepartmentDetail, CheckDepartmentNameResult, DepartmentHierarchyLevelInput } from 'src/services/types/organization';

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
import { useLevelRemove, useLevelRename, useDepartmentById, useCreateDepartment, useUpdateDepartment } from 'src/services/hooks/use-organization';

import { Iconify } from 'src/components/iconify';
import { MergeLevelDialog } from 'src/components/delete-level-dialog';
import { PageHeader, PageContainer } from 'src/components/page-layout';

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
  const [selectedZoneIds, setSelectedZoneIds] = useState<number[]>([]);
  const [departmentAdminId, setDepartmentAdminId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [hierarchyLevels, setHierarchyLevels] = useState<DepartmentHierarchyLevelInput[]>([]);
  const [levelsGenerated, setLevelsGenerated] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [nameError, setNameError] = useState('');
  const [zoneError, setZoneError] = useState('');
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
  const { mutateAsync: renameLevel } = useLevelRename();

  const [mergeLevel, setMergeLevel] = useState<{ levelNumber: number; roleName: string } | null>(null);
  const [editingLevelName, setEditingLevelName] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const formDisabled = levelsGenerated;

  const canGenerate = name.trim().length > 0 && selectedZoneIds.length > 0 && nameValidation.state !== 'unavailable';

  const doCheckName = useCallback(async (checkName: string, checkZoneId: number, excludeId?: number): Promise<{ state: 'available' | 'unavailable'; message: string; existingInZones?: { zoneId: number; zoneName: string }[] } | null> => {
    if (!checkName.trim() || !checkZoneId) return null;
    try {
      const res = await departmentService.checkName(checkName.trim(), checkZoneId, excludeId);
      const result = res.data as CheckDepartmentNameResult;
      if (result.available) {
        return { state: 'available', message: '' };
      }
      return { state: 'unavailable', message: result.message ?? '', existingInZones: result.existingInZones };
    } catch {
      return null;
    }
  }, []);

  const triggerValidation = useCallback((val: string, zoneIds: number[]) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim() || zoneIds.length === 0) {
      setNameValidation({ state: 'idle', message: '' });
      return;
    }
    setNameValidation({ state: 'checking', message: '' });
    debounceRef.current = setTimeout(async () => {
      const results = await Promise.all(zoneIds.map((zone) => doCheckName(val, zone, departmentId)));
      const unavailable = results.find((r) => r?.state === 'unavailable');
      if (unavailable) {
        setNameValidation({ state: 'unavailable', message: unavailable.message ?? '' });
        setNameError(unavailable.message ?? '');
      } else {
        setNameValidation({ state: 'available', message: '' });
        setNameError('');
      }
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
      const zoneIds = (d as any).zoneIds ?? (d.zoneId ? [d.zoneId] : []);
      setSelectedZoneIds(zoneIds);

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
      setLevelsError('Maximum 20 roles are allowed.');
    }
  }, []);

  const handleLevelsBlur = useCallback(() => {
    const num = parseInt(levelsInputValue, 10);
    if (!Number.isNaN(num) && (num < 1 || num > 20)) {
      setLevelsInputValue(String(numberOfLevels));
      if (num > 20) {
        setLevelsError('Maximum 20 roles are allowed.');
      } else {
        setLevelsError('Minimum 1 role is required.');
      }
    }
  }, [levelsInputValue, numberOfLevels]);

  const handleGenerateHierarchy = useCallback(() => {
    const count = numberOfLevels;
    if (count < 1 || count > 20) {
      setLevelsError('Maximum 20 roles are allowed.');
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

    if (selectedZoneIds.length === 0) {
      setZoneError('Zone is required');
      valid = false;
    } else {
      setZoneError('');
    }

    if (numberOfLevels < 1 || numberOfLevels > 20 || !Number.isInteger(numberOfLevels)) {
      setLevelsError('Maximum 20 roles are allowed.');
      valid = false;
    } else {
      setLevelsError('');
    }

    if (!levelsGenerated || hierarchyLevels.length === 0) {
      setLevelsError('Click "Generate Roles" before saving');
      valid = false;
    } else if (hierarchyLevels.length !== numberOfLevels) {
      setLevelsError(`Expected ${numberOfLevels} roles, but ${hierarchyLevels.length} generated`);
      valid = false;
    } else {
      setLevelsError('');
    }

    const newHierarchyErrors: Record<number, string> = {};
    const roleNames = new Set<string>();
    hierarchyLevels.forEach((hl) => {
      if (!hl.roleName.trim()) {
        newHierarchyErrors[hl.levelNumber] = 'Role name is required';
        valid = false;
      } else if (roleNames.has(hl.roleName.trim().toLowerCase())) {
        newHierarchyErrors[hl.levelNumber] = 'Duplicate role name';
        valid = false;
      }
      roleNames.add(hl.roleName.trim().toLowerCase());
    });
    setHierarchyErrors(newHierarchyErrors);

    return valid;
  }, [name, nameValidation, selectedZoneIds, numberOfLevels, levelsGenerated, hierarchyLevels]);

  const handleRemoveLevel = useCallback(async (destinationLevelNumber: number) => {
    if (!mergeLevel || !departmentId) return;
    try {
      await removeLevel({ departmentId, levelNumber: mergeLevel.levelNumber, payload: { mode: 'MERGE', destinationLevelNumber } });
      setHierarchyLevels((prev) => prev.filter((hl) => hl.levelNumber !== mergeLevel.levelNumber));
      setNumberOfLevels((prev) => prev - 1);
      setLevelsInputValue(String(numberOfLevels - 1));
      setMergeLevel(null);
    } catch {
      // error handled by mutation
    }
  }, [mergeLevel, departmentId, removeLevel, numberOfLevels]);

  const handleRename = useCallback(async (levelNumber: number, newName: string) => {
    if (!newName.trim()) return;
    const duplicate = hierarchyLevels.find(
      (hl) => hl.levelNumber !== levelNumber && hl.roleName.toLowerCase() === newName.trim().toLowerCase(),
    );
    if (duplicate) {
      setHierarchyErrors((prev) => ({ ...prev, [levelNumber]: `Role name "${newName.trim()}" already exists` }));
      return;
    }
    setHierarchyLevels((prev) =>
      prev.map((hl) => (hl.levelNumber === levelNumber ? { ...hl, roleName: newName.trim() } : hl)),
    );
    setEditingLevelName(null);
    setRenameValue('');
    setHierarchyErrors((prev) => {
      const next = { ...prev };
      delete next[levelNumber];
      return next;
    });
    if (departmentId) {
      try {
        await renameLevel({ departmentId, levelNumber, roleName: newName.trim() });
      } catch (err: any) {
        const msg = err?.response?.data?.message?.[0] || err?.response?.data?.message || 'Failed to rename role';
        setHierarchyErrors((prev) => ({ ...prev, [levelNumber]: msg }));
      }
    }
  }, [departmentId, hierarchyLevels, renameLevel]);

  const startEditingName = useCallback((levelNumber: number, currentName: string) => {
    setEditingLevelName(levelNumber);
    setRenameValue(currentName);
  }, []);

  const cancelEditingName = useCallback(() => {
    setEditingLevelName(null);
    setRenameValue('');
  }, []);

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
            zoneId: selectedZoneIds[0],
            hierarchyLevels,
            isActive,
          },
        });
        setSuccessMessage(`${name.trim()} has been updated successfully.`);
      } else {
        const results = await Promise.allSettled(
          selectedZoneIds.map((zoneId) =>
            createDepartment({
              name: name.trim(),
              numberOfLevels,
              departmentAdminId: departmentAdminId ?? undefined,
              zoneId,
              hierarchyLevels,
              isActive: true,
            }),
          ),
        );

        const succeeded = results.filter((r) => r.status === 'fulfilled').length;
        const failed = results.filter((r) => r.status === 'rejected').length;

        if (failed === 0) {
          const zoneNames = selectedZoneIds.map((zid) => activeZones.find((z: any) => z.id === zid)?.name).filter(Boolean).join(', ');
          setSuccessMessage(`${name.trim()} created for ${zoneNames}.`);
        } else if (succeeded > 0) {
          const succeededZoneNames = selectedZoneIds
            .filter((_, i) => results[i].status === 'fulfilled')
            .map((zid) => activeZones.find((z: any) => z.id === zid)?.name)
            .filter(Boolean)
            .join(', ');
          const failedZoneNames = selectedZoneIds
            .filter((_, i) => results[i].status === 'rejected')
            .map((zid) => activeZones.find((z: any) => z.id === zid)?.name)
            .filter(Boolean)
            .join(', ');
          setSuccessMessage(`${name.trim()} created for ${succeededZoneNames}. Failed for ${failedZoneNames}.`);
        } else {
          const firstError = (results.find((r) => r.status === 'rejected') as PromiseRejectedResult)?.reason;
          throw firstError;
        }
      }
      setShowSuccess(true);
      setTimeout(() => navigate(paths.dashboard.departmentMaster), 1500);
    } catch (err: any) {
      const msg = err?.response?.data?.message?.[0] || err?.message || 'Failed to save department';
      setSaveError(msg);
    }
  }, [isEdit, departmentId, name, numberOfLevels, departmentAdminId, selectedZoneIds, activeZones, hierarchyLevels, isActive, validate, createDepartment, updateDepartment, navigate]);

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

        {/* ===== DEPARTMENT INFORMATION ===== */}
        <Card sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="subtitle1">Department Information</Typography>
            {formDisabled && (
              <Button variant="text" size="small" onClick={() => setLevelsGenerated(false)}>
                Edit
              </Button>
            )}
          </Box>

          {/* Row 1: Zone Multi Select | Department Name */}
          <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={3} sx={{ mb: 3 }}>
            <Autocomplete
              multiple
              options={activeZones}
              getOptionLabel={(option) => option.name}
              value={activeZones.filter((z: any) => selectedZoneIds.includes(z.id))}
              onChange={(_, newValue) => {
                const ids = (newValue as any[]).map((z: any) => z.id);
                setSelectedZoneIds(ids);
                setZoneError('');
                if (name.trim() && ids.length > 0) {
                  triggerValidation(name, ids);
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
                  placeholder="Search zones..."
                  error={!!zoneError}
                  helperText={zoneError}
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
                if (selectedZoneIds.length > 0) {
                  triggerValidation(val, selectedZoneIds);
                }
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
            <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold" width={20} />} sx={{ mb: 3 }}>
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
                Creating &ldquo;{name}&rdquo; will create a separate Department per Zone.
              </Typography>
            </Alert>
          )}

          {/* Row 2: No. of Levels | Department Admin (Optional) */}
          <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={3}>
            <TextField
              label="No. of Roles"
              type="text"
              inputMode="numeric"
              placeholder="Enter number of levels"
              value={levelsInputValue}
              onChange={(e) => handleLevelsChange(e.target.value)}
              onBlur={handleLevelsBlur}
              disabled={formDisabled}
              error={!!levelsError}
              helperText={levelsError}
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
              }}
              disabled={formDisabled}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Department Administrator (Optional)"
                  placeholder="Select admin"
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
                sx={{ width: { xs: 1, sm: 300 } }}
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
                sx={{ width: { xs: 1, sm: 'auto' }, minWidth: { sm: 280 } }}
              >
                Generate Levels
              </Button>
            </Box>
          )}
        </Card>

        {/* ===== LEVEL MAPPING ===== */}
        {levelsGenerated && hierarchyLevels.length > 0 && (
          <Card sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1">Level Mapping</Typography>
              <Button
                variant="text"
                size="small"
                onClick={() => setLevelsGenerated(false)}
              >
                Edit
              </Button>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {hierarchyLevels
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((hl, index) => (
                  <Box key={hl.levelNumber}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        py: 1.25,
                        px: 1,
                        borderRadius: 1,
                        bgcolor: hierarchyErrors[hl.levelNumber] ? 'error.lighter' : 'transparent',
                        transition: 'background-color 0.15s',
                      }}
                    >
                      {/* Level number */}
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{ minWidth: 60, color: 'text.secondary', flexShrink: 0 }}
                      >
                        Level {hl.levelNumber}
                      </Typography>

                      {/* Arrow separator */}
                      <Iconify icon="solar:alt-arrow-right-bold" width={16} sx={{ color: 'text.disabled', flexShrink: 0 }} />

                      {/* Editable role name */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        {editingLevelName === hl.levelNumber ? (
                          <TextField
                            size="small"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRename(hl.levelNumber, renameValue);
                              if (e.key === 'Escape') cancelEditingName();
                            }}
                            onBlur={() => handleRename(hl.levelNumber, renameValue)}
                            autoFocus
                            fullWidth
                            error={!!hierarchyErrors[hl.levelNumber]}
                            helperText={hierarchyErrors[hl.levelNumber]}
                            placeholder="Enter Role Name"
                          />
                        ) : (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              cursor: 'text',
                              py: 0.5,
                              px: 1.25,
                              borderRadius: 0.75,
                              border: '1px solid',
                              borderColor: 'divider',
                              bgcolor: 'background.paper',
                              '&:hover': { borderColor: 'text.disabled' },
                            }}
                            onClick={() => startEditingName(hl.levelNumber, hl.roleName)}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                flex: 1,
                                color: hl.roleName ? 'text.primary' : 'text.disabled',
                                fontStyle: hl.roleName ? 'normal' : 'italic',
                              }}
                            >
                              {hl.roleName || 'Enter Role Name'}
                            </Typography>
                            <Iconify icon="solar:pen-bold" width={14} sx={{ color: 'text.disabled', opacity: 0.5, flexShrink: 0 }} />
                          </Box>
                        )}
                      </Box>

                      {/* Minus button - triggers merge dialog */}
                      <Tooltip title={hierarchyLevels.length <= 1 ? 'Cannot remove the last level' : 'Remove this level'}>
                        <span>
                          <Box
                            component="span"
                            onClick={() => {
                              if (hierarchyLevels.length <= 1) return;
                              setMergeLevel({ levelNumber: hl.levelNumber, roleName: hl.roleName });
                            }}
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: 0.75,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: hierarchyLevels.length <= 1 ? 'not-allowed' : 'pointer',
                              color: hierarchyLevels.length <= 1 ? 'text.disabled' : 'error.main',
                              bgcolor: hierarchyLevels.length <= 1 ? 'action.disabledBackground' : 'error.lighter',
                              '&:hover': hierarchyLevels.length <= 1 ? {} : { bgcolor: 'error.light', color: 'error.contrastText' },
                              flexShrink: 0,
                              transition: 'all 0.15s',
                            }}
                          >
                            <Iconify icon="solar:minus-circle-bold" width={16} />
                          </Box>
                        </span>
                      </Tooltip>
                    </Box>
                    {index < hierarchyLevels.length - 1 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1 }}>
                        <Box sx={{ minWidth: 60 }} />
                        <Box sx={{ flex: 1, borderTop: '1px dashed', borderColor: 'divider' }} />
                      </Box>
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

      <MergeLevelDialog
        open={mergeLevel !== null}
        levelNumber={mergeLevel?.levelNumber ?? null}
        levelName={mergeLevel?.roleName ?? ''}
        hierarchyLevels={hierarchyLevels as HierarchyLevel[]}
        onClose={() => setMergeLevel(null)}
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
