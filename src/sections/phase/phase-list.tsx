import type { Phase } from 'src/types';
import type { GridColDef } from '@mui/x-data-grid';

import dayjs from 'dayjs';
import { Helmet } from 'react-helmet-async';
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { mockPhases } from 'src/services/mock-data';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { DataTable } from 'src/components/data-table';
import { RowActionsMenu } from 'src/components/row-actions';
import { PageHeader, PageContainer } from 'src/components/page-layout';

export default function PhaseListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<Phase[]>(mockPhases);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = useCallback(() => {
    if (deleteId) {
      setData((prev) => prev.filter((item) => item.id !== deleteId));
      setDeleteId(null);
    }
  }, [deleteId]);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 60 },
    { field: 'phaseName', headerName: 'Phase Name', flex: 1, minWidth: 150 },
    { field: 'projectName', headerName: 'Project', width: 180 },
    {
      field: 'launchEnabled', headerName: 'Launch', width: 90,
      renderCell: (params) => (
        <Label color={params.value ? 'success' : 'default'}>{params.value ? 'Y' : 'N'}</Label>
      ),
    },
    {
      field: 'sustenanceEnabled', headerName: 'Sustenance', width: 110,
      renderCell: (params) => (
        <Label color={params.value ? 'info' : 'default'}>{params.value ? 'Y' : 'N'}</Label>
      ),
    },
    {
      field: 'possessionDate', headerName: 'Possession', width: 120,
      valueFormatter: (value) => dayjs(value).format('DD MMM YYYY'),
    },
    { field: 'brandName', headerName: 'Brand', width: 130 },
    { field: 'cityName', headerName: 'City', width: 120 },
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
            { label: 'Edit', icon: 'solar:pen-bold', onClick: () => navigate(paths.dashboard.phaseMasterEdit(params.row.id)) },
            { label: 'Edit Launch', icon: 'solar:calendar-bold', onClick: () => navigate(paths.dashboard.phaseMasterEdit(params.row.id)) },
            { label: 'Delete', icon: 'solar:trash-bin-trash-bold', onClick: () => setDeleteId(params.row.id), color: 'error.main' },
          ]} />
        </Stack>
      ),
    },
  ];

  return (
    <>
      <Helmet><title>Phases - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader title="Phases" description="Manage project phases and launch configurations" action={
          <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={() => navigate(paths.dashboard.phaseMasterCreate)}>
            Create Phase
          </Button>
        } />
        <Card sx={{ overflow: 'hidden' }}>
          <DataTable columns={columns} rows={data} getRowId={(r) => r.id} />
        </Card>
      </PageContainer>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs">
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this phase?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} color="inherit">Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
