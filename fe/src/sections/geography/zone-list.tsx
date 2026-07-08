import { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import type { GridColDef } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';
import { CONFIG } from 'src/config-global';
import { DataTable } from 'src/components/data-table';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { RowActionsMenu } from 'src/components/row-actions';
import { PageContainer, PageHeader } from 'src/components/page-layout';
import { mockZones, mockCities } from 'src/services/mock-data';
import { paths } from 'src/routes/paths';
import type { Zone } from 'src/types';

export default function ZoneListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<Zone[]>(mockZones);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const getMappedCities = (zoneId: string) => mockCities.filter((c) => c.zoneId === zoneId);

  const handleDelete = useCallback(() => {
    if (deleteId) {
      setData((prev) => prev.filter((item) => item.id !== deleteId));
      setDeleteId(null);
    }
  }, [deleteId]);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 60 },
    { field: 'name', headerName: 'Zone Name', flex: 1, minWidth: 180 },
    {
      field: 'mappedCities', headerName: 'Mapped Cities', width: 300, sortable: false,
      renderCell: (params) => {
        const cities = getMappedCities(params.row.id);
        const visible = cities.slice(0, 3);
        const remaining = cities.length - 3;
        return (
          <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', py: 1 }}>
            {cities.length === 0 && (
              <Typography variant="caption" color="text.disabled">—</Typography>
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
    { field: 'createdBy', headerName: 'Created By', width: 140 },
    {
      field: 'createdAt', headerName: 'Created Date', width: 130,
      valueFormatter: (value) => dayjs(value).format('DD MMM YYYY'),
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
        <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'center', width: 1 }}>
          <RowActionsMenu actions={[
            { label: 'Edit', icon: 'solar:pen-bold', onClick: () => navigate(paths.dashboard.zoneMasterEdit(params.row.id)) },
            { label: 'Delete', icon: 'solar:trash-bin-trash-bold', onClick: () => setDeleteId(params.row.id), color: 'error.main' },
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
