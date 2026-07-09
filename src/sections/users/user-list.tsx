import { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import type { GridColDef } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Card from '@mui/material/Card';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { CONFIG } from 'src/config-global';
import { DataTable } from 'src/components/data-table';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { PageContainer, PageHeader } from 'src/components/page-layout';
import { RowActionsMenu } from 'src/components/row-actions';
import { mockUsers, mockZones } from 'src/services/mock-data';
import type { User } from 'src/types';
import { paths } from 'src/routes/paths';

export default function UserListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<User[]>(mockUsers);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = useCallback(() => {
    if (deleteId) {
      setData((prev) => prev.filter((item) => item.id !== deleteId));
      setDeleteId(null);
    }
  }, [deleteId]);

  const columns: GridColDef[] = [
    { field: 'employeeId', headerName: 'Employee ID', width: 110 },
    {
      field: 'name', headerName: 'User Details', flex: 1, minWidth: 160,
      renderCell: (params) => (
        <Stack sx={{ height: 1, justifyContent: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{params.row.name}</Typography>
        </Stack>
      ),
    },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'phone', headerName: 'Mobile', width: 130 },
    { field: 'departmentName', headerName: 'Department', width: 150 },
    { field: 'roleName', headerName: 'Role', width: 150 },
    {
      field: 'zoneNames', headerName: 'Zone', width: 140,
      renderCell: (params) => {
        const zones = params.row.zoneNames;
        return zones?.length ? zones.join(', ') : '-';
      },
    },
    { field: 'createdBy', headerName: 'Created By', width: 110 },
    {
      field: 'createdAt', headerName: 'Created Date', width: 120,
      renderCell: (params) => dayjs(params.value).format('DD/MM/YYYY'),
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
            { label: 'View', icon: 'solar:eye-bold', onClick: () => navigate(paths.dashboard.userDetail(params.row.id)) },
            { label: 'Delete', icon: 'solar:trash-bin-trash-bold', onClick: () => setDeleteId(params.row.id), color: 'error.main' },
          ]} />
        </Stack>
      ),
    },
  ];

  return (
    <>
      <Helmet><title>Users - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader title="Users" description="Manage user accounts and access" action={
          <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={() => navigate(paths.dashboard.userNew)}>
            Add User
          </Button>
        } />
        <Card sx={{ overflow: 'hidden' }}>
          <DataTable columns={columns} rows={data} getRowId={(r) => r.id} onRowClick={(row) => navigate(paths.dashboard.userDetail(row.id))} />
        </Card>
      </PageContainer>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs">
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this user?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} color="inherit">Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}