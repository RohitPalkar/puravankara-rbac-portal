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
import { CONFIG } from 'src/config-global';
import { PageContainer, PageHeader } from 'src/components/page-layout';
import { Iconify } from 'src/components/iconify';
import { paths } from 'src/routes/paths';
import {
  useDepartmentById,
  useCreateDepartment,
  useUpdateDepartment,
} from 'src/services/hooks/use-organization';
import { useMyPermissions } from 'src/services/hooks/use-permissions';
import type { CreateDepartmentRequest, UpdateDepartmentRequest } from 'src/services/types/organization';

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

  const [name, setName] = useState('');
  const [maxHierarchyLevels, setMaxHierarchyLevels] = useState<number>(4);
  const [isActive, setIsActive] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [nameError, setNameError] = useState('');

  const saving = isCreating || isUpdating;

  useEffect(() => {
    if (deptData) {
      setName(deptData.name);
      setMaxHierarchyLevels(deptData.maxHierarchyLevels);
      setIsActive(deptData.isActive);
    }
  }, [deptData]);

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      setNameError('Department name is required');
      return;
    }
    setNameError('');

    try {
      if (isEdit && departmentId) {
        const payload: UpdateDepartmentRequest = { name: name.trim(), maxHierarchyLevels };
        if (isActive !== deptData?.isActive) payload.isActive = isActive;
        await updateDepartment({ id: departmentId, data: payload });
      } else {
        await createDepartment({ name: name.trim(), maxHierarchyLevels, isActive } as CreateDepartmentRequest);
      }
      setShowSuccess(true);
      setTimeout(() => navigate(paths.dashboard.departmentMaster), 1200);
    } catch {
      // error handled by query cache invalidation
    }
  }, [name, maxHierarchyLevels, isActive, isEdit, departmentId, deptData, createDepartment, updateDepartment, navigate]);

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

        <Card sx={{ p: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2.5 }}>Department Details</Typography>
          <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5}>
            <TextField
              label="Department Name"
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError(''); }}
              error={!!nameError}
              helperText={nameError}
              required
              fullWidth
            />
            <TextField
              label="Number of Levels"
              type="number"
              value={maxHierarchyLevels}
              onChange={(e) => setMaxHierarchyLevels(Number(e.target.value))}
              inputProps={{ min: 1, max: 10 }}
              helperText="Defines the maximum hierarchy depth available for this department."
              fullWidth
            />
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

        <Box sx={{ position: 'sticky', bottom: 0, zIndex: 10, bgcolor: 'background.default', borderTop: '1px solid', borderColor: 'divider', py: 2, px: 0, mt: 3 }}>
          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => navigate(paths.dashboard.departmentMaster)} size="large">
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
          Department {isEdit ? 'updated' : 'created'} successfully
        </Alert>
      </Snackbar>
    </>
  );
}
