import type { DepartmentDetail, DepartmentHierarchyLevelInput } from 'src/services/types/organization';

import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { queryKeys } from 'src/services/api/query-keys';
import { userService } from 'src/services/services/user.service';
import { useMyPermissions } from 'src/services/hooks/use-permissions';
import { zoneService } from 'src/services/services/geography.service';
import { useDepartmentById, useCreateDepartment, useUpdateDepartment } from 'src/services/hooks/use-organization';

import { Iconify } from 'src/components/iconify';
import { PageHeader, PageContainer } from 'src/components/page-layout';

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
    queryKey: queryKeys.zones.list({ limit: 200 }),
    queryFn: async () => {
      const res = await zoneService.list({ limit: 200 } as any);
      return (res.data ?? []) as any[];
    },
  });

  const { data: users } = useQuery({
    queryKey: queryKeys.users.list({ limit: 500 }),
    queryFn: async () => {
      const res = await userService.list({ limit: 500 } as any);
      return (res.data ?? []) as any[];
    },
  });

  const activeUsers = useMemo(
    () => (users ?? []).filter((u: any) => u.isActive),
    [users],
  );

  const zoneOptions = useMemo(
    () => (zones ?? []).map((z: any) => ({ id: z.id, name: z.name })),
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

  const [nameError, setNameError] = useState('');
  const [zoneError, setZoneError] = useState('');
  const [adminError, setAdminError] = useState('');
  const [levelsError, setLevelsError] = useState('');
  const [hierarchyErrors, setHierarchyErrors] = useState<Record<number, string>>({});

  const saving = isCreating || isUpdating;

  const formDisabled = levelsGenerated;

  const zoneSelected = selectedZoneIds.length > 0;
  const levelsValid = numberOfLevels >= 1 && numberOfLevels <= 20;
  const canGenerate = zoneSelected && levelsValid;

  useEffect(() => {
    if (deptData) {
      const d = deptData as unknown as DepartmentDetail;
      setName(d.name);
      setNumberOfLevels(d.maxHierarchyLevels);
      setLevelsInputValue(String(d.maxHierarchyLevels));
      setIsActive(d.isActive);
      setDepartmentAdminId(d.departmentAdminId);
      setSelectedZoneIds(d.zones?.map((z) => z.zoneId) ?? []);

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
    } else {
      setNameError('');
    }

    if (selectedZoneIds.length === 0) {
      setZoneError('At least one zone must be selected');
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
  }, [name, selectedZoneIds, departmentAdminId, numberOfLevels, levelsGenerated, hierarchyLevels]);

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
            zoneIds: selectedZoneIds,
            hierarchyLevels,
            isActive,
          },
        });
      } else {
        await createDepartment({
          name: name.trim(),
          numberOfLevels,
          departmentAdminId: departmentAdminId ?? undefined,
          zoneIds: selectedZoneIds,
          hierarchyLevels,
          isActive: true,
        });
      }
      setShowSuccess(true);
      setTimeout(() => navigate(paths.dashboard.departmentMaster), 1200);
    } catch (err: any) {
      const msg = err?.response?.data?.message?.[0] || err?.message || 'Failed to save department';
      setSaveError(msg);
    }
  }, [isEdit, departmentId, name, numberOfLevels, departmentAdminId, selectedZoneIds, hierarchyLevels, isActive, validate, createDepartment, updateDepartment, navigate]);

  if (isEdit && isFetching) {
    return (
      <PageContainer>
        <PageHeader title="Edit Department" />
        <Card sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Card>
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
            <Typography variant="subtitle1">Department Details</Typography>
            {formDisabled && (
              <Button variant="text" size="small" onClick={() => setLevelsGenerated(false)}>
                Edit
              </Button>
            )}
          </Box>

          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={3}>
            <Autocomplete
              multiple
              options={zoneOptions}
              getOptionLabel={(option) => option.name}
              value={zoneOptions.filter((z) => selectedZoneIds.includes(z.id))}
              onChange={(_, newValue) => {
                setSelectedZoneIds(newValue.map((v) => v.id));
                setZoneError('');
              }}
              disabled={formDisabled}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Zone"
                  placeholder="Select zones"
                  error={!!zoneError}
                  helperText={zoneError}
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip label={option.name} size="small" {...getTagProps({ index })} />
                ))
              }
            />
            <TextField
              label="Department Name"
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError(''); }}
              error={!!nameError}
              helperText={nameError}
              required
              disabled={formDisabled}
            />
            <TextField
              label="No. of Levels"
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
                  label="Department Admin"
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
              <Typography variant="subtitle1">Level Mapping</Typography>
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

      <Snackbar open={showSuccess} autoHideDuration={2000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" sx={{ width: 1 }}>
          Department {isEdit ? 'updated' : 'created'} successfully
        </Alert>
      </Snackbar>
    </>
  );
}
