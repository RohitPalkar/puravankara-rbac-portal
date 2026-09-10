import type { CreateBDLandTeamMemberRequest, UpdateBDLandTeamMemberRequest } from 'src/services/types/master';

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
import { useBDLandTeamById, useAllMasterCities, useMasterDepartmentList, useCreateBDLandTeamMember, useUpdateBDLandTeamMember } from 'src/services/hooks/use-masters';

import { Iconify } from 'src/components/iconify';
import { FormSection } from 'src/components/form-section';
import { PageHeader, PageContainer } from 'src/components/page-layout';
import { renderDropdownItems } from 'src/components/hook-form/dropdown-empty';

export default function BDLandTeamFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const memberId = id ? Number(id) : undefined;

  const { data: memberData, isLoading: isFetching, isError: isFetchError } = useBDLandTeamById(memberId ?? 0);
  const { data: cities } = useAllMasterCities();
  const { data: departments } = useMasterDepartmentList();
  const { mutateAsync: createMember, isPending: isCreating } = useCreateBDLandTeamMember();
  const { mutateAsync: updateMember, isPending: isUpdating } = useUpdateBDLandTeamMember();

  const [empId, setEmpId] = useState('');
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [cityIds, setCityIds] = useState<number[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  const [empIdError, setEmpIdError] = useState('');
  const [nameError, setNameError] = useState('');

  const saving = isCreating || isUpdating;

  useEffect(() => {
    if (memberData) {
      setEmpId(memberData.empId);
      setName(memberData.name);
      setDesignation(memberData.designation);
      setDepartment(memberData.department);
      setEmail(memberData.email);
      setMobile(memberData.mobile);
      setCityIds(memberData.cityIds ?? []);
      setIsActive(memberData.isActive);
    }
  }, [memberData]);

  const toggleCity = useCallback((cityId: number) => {
    setCityIds((prev) => (prev.includes(cityId) ? prev.filter((c) => c !== cityId) : [...prev, cityId]));
  }, []);

  const handleSave = useCallback(async () => {
    let valid = true;
    if (!empId.trim()) { setEmpIdError('Employee ID is required'); valid = false; } else setEmpIdError('');
    if (!name.trim()) { setNameError('Employee name is required'); valid = false; } else setNameError('');
    if (!valid) return;

    const payload: CreateBDLandTeamMemberRequest = {
      empId: empId.trim(),
      name: name.trim(),
      designation: designation.trim(),
      department,
      email: email.trim(),
      mobile: mobile.trim(),
      cityIds,
      isActive,
    };

    try {
      if (isEdit && memberId) {
        await updateMember({ id: memberId, data: payload as UpdateBDLandTeamMemberRequest });
      } else {
        await createMember(payload);
      }
      setShowSuccess(true);
      setTimeout(() => navigate(paths.dashboard.masters.team), 1200);
    } catch {
      // error handled by query cache invalidation
    }
  }, [empId, name, designation, department, email, mobile, cityIds, isActive, isEdit, memberId, createMember, updateMember, navigate]);

  if (isEdit && isFetching) {
    return (
      <PageContainer>
        <PageHeader title="Edit Team Member" />
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

  if (isEdit && (isFetchError || (!isFetching && !memberData))) {
    return (
      <PageContainer>
        <PageHeader title="Team Member Not Found" description="The requested team member does not exist" />
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">Team member with ID &quot;{id}&quot; not found.</Typography>
          <Button onClick={() => navigate(paths.dashboard.masters.team)} sx={{ mt: 2 }}>Back to BD &amp; Land Team</Button>
        </Card>
      </PageContainer>
    );
  }

  return (
    <>
      <Helmet><title>{isEdit ? 'Edit Team Member' : 'Add Team Member'} - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader
          title={isEdit ? 'Edit Team Member' : 'Add Team Member'}
          description={isEdit ? 'Update team member details' : 'Add a new BD & Land team member'}
        />

        {saving && <LinearProgress />}

        <Card sx={{ p: 4 }}>
          <FormSection title="Employee Information">
            <TextField
              label="Employee ID"
              value={empId}
              onChange={(e) => { setEmpId(e.target.value); setEmpIdError(''); }}
              error={!!empIdError}
              helperText={empIdError}
              required
              placeholder="e.g. E0004"
            />
            <TextField
              label="Employee Name"
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError(''); }}
              error={!!nameError}
              helperText={nameError}
              required
            />
            <TextField label="Designation" value={designation} onChange={(e) => setDesignation(e.target.value)} required placeholder="e.g. Land Executive" />
            <TextField
              label="Department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              select
              required
            >
              {renderDropdownItems(departments?.data, (d) => (
                <MenuItem key={d.id} value={d.name}>{d.name}</MenuItem>
              ))}
            </TextField>
            <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <TextField label="Mobile Number" value={mobile} onChange={(e) => setMobile(e.target.value)} />
          </FormSection>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>Assigned Cities</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {(cities ?? []).map((city) => (
                <Button
                  key={city.id}
                  size="small"
                  variant={cityIds.includes(city.id) ? 'contained' : 'outlined'}
                  onClick={() => toggleCity(city.id)}
                >
                  {city.name}
                </Button>
              ))}
              {(cities ?? []).length === 0 && (
                <Typography variant="body2" color="text.disabled">No cities available.</Typography>
              )}
            </Box>
          </Box>

          {isEdit && (
            <FormSection title="Status">
              <TextField
                select
                label="Status"
                value={isActive ? 'active' : 'inactive'}
                onChange={(e) => setIsActive(e.target.value === 'active')}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
              <Box />
            </FormSection>
          )}
        </Card>

        <Box sx={{ position: 'sticky', bottom: 0, zIndex: 10, bgcolor: 'background.default', borderTop: '1px solid', borderColor: 'divider', py: 2, px: 0, mt: 3 }}>
          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => navigate(paths.dashboard.masters.team)} size="large">
              Cancel
            </Button>
            <Button variant="contained" startIcon={<Iconify icon="solar:check-circle-bold" />} onClick={handleSave} disabled={saving} size="large">
              {saving ? 'Saving...' : 'Save Member'}
            </Button>
          </Stack>
        </Box>
      </PageContainer>

      <Snackbar open={showSuccess} autoHideDuration={2000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" sx={{ width: 1 }}>
          Team member {isEdit ? 'updated' : 'created'} successfully
        </Alert>
      </Snackbar>
    </>
  );
}
