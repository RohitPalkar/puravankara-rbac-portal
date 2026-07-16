import type { Zone } from 'src/types';
import type { GridColDef } from '@mui/x-data-grid';

import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { isApiMode } from 'src/services/data-source';
import { useZones, useDeleteZone } from 'src/services/api-adapters';
import { mockCities, mockProjectZones } from 'src/services/mock-data';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { DataTable } from 'src/components/data-table';
import { RowActionsMenu } from 'src/components/row-actions';
import { PageHeader, PageContainer } from 'src/components/page-layout';

export default function ZoneListPage() {
  const navigate = useNavigate();
  const { data: apiData, loading, error, refetch } = useZones();
  const [data, setData] = useState<Zone[]>([]);
  useEffect(() => { setData(apiData); }, [apiData]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { mutate: deleteZone } = useDeleteZone();

  const getMappedCities = (zoneId: string) => mockCities.filter((c) => c.zoneId === zoneId);
  const getProjectCount = (zoneId: string) => (mockProjectZones[zoneId] ?? []).length;

  const handleDelete = useCallback(async () => {
    if (deleteId) {
      if (isApiMode()) {
        try {
          await deleteZone(deleteId);
          refetch();
        } catch (e) { console.error(e); }
      } else {
        setData((prev) => prev.filter((item) => item.id !== deleteId));
      }
      setDeleteId(null);
    }
  }, [deleteId, refetch, deleteZone]);

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Zone Name', flex: 1, minWidth: 180 },
    {
      field: 'mappedCities', headerName: 'Mapped Cities', width: 340, sortable: false,
      renderCell: (params) => {
        const cities = getMappedCities(params.row.id);
        const visible = cities.slice(0, 3);
        const remaining = cities.length - 3;
        return (
          <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', py: 1 }} alignItems="center">
            {cities.length === 0 && (
              <Typography variant="caption" color="text.disabled">No cities mapped</Typography>
            )}
            {visible.map((city) => (
              <Chip key={city.id} label={city.name} size="small" variant="outlined" sx={{ height: 22, fontSize: 11 }} />
            ))}
            {remaining > 0 && (
              <Chip label={`+${remaining} More`} size="small" color="primary" variant="soft" sx={{ height: 22, fontSize: 11 }} />
            )}
          </Stack>
        );
      },
    },
    {
      field: 'projectCount', headerName: 'Project Count', width: 130,
      renderCell: (params) => {
        const count = getProjectCount(params.row.id);
        return <Typography variant="body2">{count} {count === 1 ? 'project' : 'projects'}</Typography>;
      },
    },
    {
      field: 'salaryCap', headerName: 'Salary Cap (₹)', width: 140,
      renderCell: (params) => {
        const cap = params.row.salaryCap;
        if (cap == null) return <Typography variant="body2" color="text.disabled">—</Typography>;
        return <Typography variant="body2">{cap.toLocaleString('en-IN')}</Typography>;
      },
    },
    {
      field: 'status', headerName: 'Status', width: 100,
      renderCell: (params) => (
        <Label color={params.value === 'active' ? 'success' : 'default'}>{params.value}</Label>
      ),
    },
    {
      field: 'actions', headerName: '', width: 60, sortable: false, disableColumnMenu: true,
      renderCell: (params) => (
        <Stack alignItems="center" sx={{ height: 1, justifyContent: 'center' }}>
          <RowActionsMenu actions={[
            { label: 'View', icon: 'solar:eye-bold', onClick: () => {} },
            { label: 'Edit', icon: 'solar:pen-bold', onClick: () => navigate(paths.dashboard.zoneMasterEdit(params.row.id)) },
            { label: 'Deactivate', icon: 'solar:lock-bold', onClick: () => {}, color: 'error.main' },
          ]} />
        </Stack>
      ),
    },
  ];

  return (
    <>
      <Helmet><title>Zones - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader title="Zones" description="Manage geographic zones and regions" action={
          <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={() => navigate(paths.dashboard.zoneMasterCreate)}>
            Create Zone
          </Button>
        } />
        <Card sx={{ overflow: 'hidden' }}>
          <DataTable columns={columns} rows={data} getRowId={(r) => r.id} />
        </Card>
        {data.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Iconify icon="solar:map-point-bold" width={48} sx={{ color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">No Zones Created</Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
              Create your first zone to start organizing geographic regions.
            </Typography>
            <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={() => navigate(paths.dashboard.zoneMasterCreate)}>
              Create Zone
            </Button>
          </Box>
        )}
      </PageContainer>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs">
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this zone?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} color="inherit">Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
