import { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import type { GridColDef } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import dayjs from 'dayjs';
import { DataTable } from 'src/components/data-table';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { CONFIG } from 'src/config-global';
import { PageContainer, PageHeader } from 'src/components/page-layout';
import { RowActionsMenu } from 'src/components/row-actions';
import { useRolePermissionsSummary } from 'src/services/hooks/use-permissions';

interface RoleSummaryRow {
  id: number;
  name: string;
  hierarchyLevelRank: number;
  departmentId: number | null;
  departmentName: string | null;
  isActive: boolean;
  isSystemRole: boolean;
  moduleCount: number;
  permissionCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function PermissionMatrixPage() {
  const { data: rows, isLoading } = useRolePermissionsSummary();

  const [deactivateId, setDeactivateId] = useState<number | null>(null);
  const [comingSoon, setComingSoon] = useState('');

  const handleEdit = useCallback(() => {
    setComingSoon('Edit flow coming in next update');
  }, []);

  const handleView = useCallback(() => {
    setComingSoon('View flow coming in next update');
  }, []);

  const handleNew = useCallback(() => {
    setComingSoon('Create Mapping wizard coming in next update');
  }, []);

  const handleToggleStatus = useCallback(
    (row: RoleSummaryRow) => {
      setDeactivateId(row.id);
    },
    [],
  );

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Role Name', flex: 1, minWidth: 160 },
    { field: 'departmentName', headerName: 'Department', width: 150, valueGetter: (_val, row: RoleSummaryRow) => row.departmentName ?? '-' },
    {
      field: 'hierarchyLevelRank', headerName: 'Hierarchy Level', width: 130,
      valueGetter: (_val, row: RoleSummaryRow) => `L${row.hierarchyLevelRank}`,
    },
    { field: 'moduleCount', headerName: 'Modules', width: 100, align: 'center', headerAlign: 'center' },
    { field: 'permissionCount', headerName: 'Permissions', width: 110, align: 'center', headerAlign: 'center' },
    {
      field: 'createdAt', headerName: 'Created Date', width: 130,
      renderCell: (params) => dayjs(params.value).format('DD/MM/YYYY'),
    },
    {
      field: 'isActive', headerName: 'Status', width: 100,
      renderCell: (params) => (
        <Label color={params.value ? 'success' : 'default'}>{params.value ? 'Active' : 'Inactive'}</Label>
      ),
    },
    {
      field: 'actions', headerName: '', width: 60, sortable: false, disableColumnMenu: true,
      renderCell: (params) => (
        <Stack alignItems="center" sx={{ height: 1, justifyContent: 'center' }}>
          <RowActionsMenu actions={[
            { label: 'Edit', icon: 'solar:pen-bold', onClick: () => { handleEdit(); } },
            { label: params.row.isActive ? 'Deactivate' : 'Activate', icon: params.row.isActive ? 'solar:forbidden-circle-bold' : 'solar:check-circle-bold', onClick: () => handleToggleStatus(params.row as RoleSummaryRow) },
            { label: 'View', icon: 'solar:eye-bold', onClick: () => { handleView(); } },
          ]} />
        </Stack>
      ),
    },
  ];

  return (
    <>
      <Helmet><title>Permission Matrix - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader
          title="Permission Matrix"
          description="Configure role-based permissions"
          action={
            <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={handleNew}>
              Create Mapping
            </Button>
          }
        />
        <Card sx={{ overflow: 'hidden' }}>
          <DataTable columns={columns} rows={rows ?? []} getRowId={(r: any) => r.id} loading={isLoading} />
        </Card>
      </PageContainer>

      <Dialog open={!!deactivateId} onClose={() => setDeactivateId(null)} maxWidth="xs">
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to change the status of this role mapping?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeactivateId(null)} color="inherit">Cancel</Button>
          <Button onClick={() => setDeactivateId(null)} color="warning" variant="contained">Confirm</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!comingSoon} autoHideDuration={3000} onClose={() => setComingSoon('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="info" variant="filled" onClose={() => setComingSoon('')}>
          {comingSoon}
        </Alert>
      </Snackbar>
    </>
  );
}
