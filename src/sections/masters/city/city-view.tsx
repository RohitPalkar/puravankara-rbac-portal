import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { useMasterCityById } from 'src/services/hooks/use-masters';

import { Iconify } from 'src/components/iconify';
import { PageHeader, PageContainer } from 'src/components/page-layout';

import ApprovalDepartmentStep from './components/approval-department-step';

export default function MasterCityViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const cityId = id ? Number(id) : 0;
  const { data: city, isLoading, isError } = useMasterCityById(cityId);

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader title="City Details" description="Loading..." />
        <Card sx={{ p: 3 }}>
          <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 1 }} />
        </Card>
      </PageContainer>
    );
  }

  if (isError || !city) {
    return (
      <PageContainer>
        <PageHeader title="City Not Found" />
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">City “{id}” not found.</Typography>
          <Button onClick={() => navigate(paths.dashboard.masters.cities)} sx={{ mt: 2 }}>Back to Cities</Button>
        </Card>
      </PageContainer>
    );
  }

  return (
    <>
      <Helmet><title>{city.name} — {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader
          title={city.name}
          description={`City Code: ${city.code} • ${city.state}, ${city.country}`}
          action={
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" startIcon={<Iconify icon="eva:arrow-back-fill" />} onClick={() => navigate(paths.dashboard.masters.cities)}>Back</Button>
              <Button variant="contained" startIcon={<Iconify icon="solar:pen-bold" />} onClick={() => navigate(paths.dashboard.masters.cityEdit(city.id))}>Edit (Admin)</Button>
            </Stack>
          }
        />

        <Card sx={{ p: 3, mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <Chip label={city.isActive ? 'Active' : 'Inactive'} color={city.isActive ? 'success' : 'default'} size="small" />
            <Typography variant="body2"><strong>Code:</strong> {city.code}</Typography>
            <Typography variant="body2"><strong>State:</strong> {city.state}</Typography>
            <Typography variant="body2"><strong>Country:</strong> {city.country}</Typography>
          </Stack>
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2"><strong>User View (read-only)</strong> — Admin uploaded checklists, templates & sample references are visible below. Users cannot edit/upload.</Typography>
          </Alert>
        </Card>

        <Card sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Iconify icon="solar:eye-bold" width={20} /> Approval & Department Mapping — User View
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            This is the non-admin perspective. Content is the same as admin upload, shown read-only.
          </Typography>

          {(!city.genericApprovals || city.genericApprovals.length === 0) ? (
            <Box sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2, bgcolor: 'grey.50' }}>
              <Typography variant="body2" color="text.secondary">No approvals configured for this city yet.</Typography>
              <Typography variant="caption" color="text.disabled">Admin needs to add Generic Approvals via Edit → Approval & Department Mapping.</Typography>
            </Box>
          ) : (
            <ApprovalDepartmentStep value={city.genericApprovals} onChange={() => {}} readOnly />
          )}
        </Card>
      </PageContainer>
    </>
  );
}
