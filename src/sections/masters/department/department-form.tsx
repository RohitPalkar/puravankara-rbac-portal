import type { CreateMasterDepartmentRequest, UpdateMasterDepartmentRequest } from 'src/services/types/master';

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
import { useMasterDepartmentById, useCreateMasterDepartment, useUpdateMasterDepartment } from 'src/services/hooks/use-masters';

import { Iconify } from 'src/components/iconify';
import { FormSection } from 'src/components/form-section';
import { PageHeader, PageContainer } from 'src/components/page-layout';

export default function MasterDepartmentFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const departmentId = id ? Number(id) : undefined;

  const { data: departmentData, isLoading: isFetching, isError: isFetchError } = useMasterDepartmentById(departmentId ?? 0);
  const { mutateAsync: createDepartment, isPending: isCreating } = useCreateMasterDepartment();
  const { mutateAsync: updateDepartment, isPending: isUpdating } = useUpdateMasterDepartment();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  const [codeError, setCodeError] = useState('');
  const [nameError, setNameError] = useState('');

  const saving = isCreating || isUpdating;

  useEffect(() => {
    if (departmentData) {
      setCode(departmentData.code);
      setName(departmentData.name);
      setDescription(departmentData.description);
      setIsActive(departmentData.isActive);
    }
  }, [departmentData]);

  const handleSave = useCallback(async () => {
    let valid = true;
    if (!code.trim()) { setCodeError('Department code is required'); valid = false; } else setCodeError('');
    if (!name.trim()) { setNameError('Department name is required'); valid = false; } else setNameError('');
    if (!valid) return;

    const payload: CreateMasterDepartmentRequest = { code: code.trim(), name: name.trim(), description: description.trim(), isActive };

    try {
      if (isEdit && departmentId) {
        await updateDepartment({ id: departmentId, data: payload as UpdateMasterDepartmentRequest });
      } else {
        await createDepartment(payload);
      }
      setShowSuccess(true);
      setTimeout(() => navigate(paths.dashboard.masters.departments), 1200);
    } catch {
      // error handled by query cache invalidation
    }
  }, [code, name, description, isActive, isEdit, departmentId, createDepartment, updateDepartment, navigate]);

  if (isEdit && isFetching) {
    return (
      <PageContainer>
        <PageHeader title="Edit Department" />
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

  if (isEdit && (isFetchError || (!isFetching && !departmentData))) {
    return (
      <PageContainer>
        <PageHeader title="Department Not Found" description="The requested department does not exist" />
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">Department with ID &quot;{id}&quot; not found.</Typography>
          <Button onClick={() => navigate(paths.dashboard.masters.departments)} sx={{ mt: 2 }}>Back to Departments</Button>
        </Card>
      </PageContainer>
    );
  }

  return (
    <>
      <Helmet><title>{isEdit ? 'Edit Department' : 'Add Department'} - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader
          title={isEdit ? 'Edit Department' : 'Add Department'}
          description={isEdit ? 'Update department details' : 'Add a new department master'}
        />

        {saving && <LinearProgress />}

        <Card sx={{ p: 4 }}>
          <FormSection title="Department Information">
            <TextField
              label="Department Code"
              value={code}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setCodeError(''); }}
              error={!!codeError}
              helperText={codeError}
              required
              placeholder="e.g. LAND"
            />
            <TextField
              label="Department Name"
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError(''); }}
              error={!!nameError}
              helperText={nameError}
              required
              placeholder="e.g. Land"
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              minRows={2}
              placeholder="Short description of the department"
              sx={{ gridColumn: { sm: 'span 2' } }}
            />
            {isEdit && (
              <TextField
                select
                label="Status"
                value={isActive ? 'active' : 'inactive'}
                onChange={(e) => setIsActive(e.target.value === 'active')}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
            )}
          </FormSection>
        </Card>

        <Box sx={{ position: 'sticky', bottom: 0, zIndex: 10, bgcolor: 'background.default', borderTop: '1px solid', borderColor: 'divider', py: 2, px: 0, mt: 3 }}>
          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => navigate(paths.dashboard.masters.departments)} size="large">
              Cancel
            </Button>
            <Button variant="contained" startIcon={<Iconify icon="solar:check-circle-bold" />} onClick={handleSave} disabled={saving} size="large">
              {saving ? 'Saving...' : 'Save Department'}
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
