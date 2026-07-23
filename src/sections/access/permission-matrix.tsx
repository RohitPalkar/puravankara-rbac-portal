import type { GridColDef } from '@mui/x-data-grid';

import dayjs from 'dayjs';
import { Helmet } from 'react-helmet-async';
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

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
import { useUpdateRole } from 'src/services/hooks/use-organization';
import { useRolePermissionsSummary } from 'src/services/hooks/use-permissions';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { DataTable } from 'src/components/data-table';
import { RowActionsMenu } from 'src/components/row-actions';
import { PageHeader, PageContainer } from 'src/components/page-layout';

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
  const navigate = useNavigate();
  const { data: rows, isLoading } = useRolePermissionsSummary();
  const { mutateAsync: updateRole, isPending: isUpdating } = useUpdateRole();

  const [deactivateRow, setDeactivateRow] = useState<RoleSummaryRow | null>(null);

  const handleEdit = useCallback(
    (row: RoleSummaryRow) => {
      navigate(paths.dashboard.permissionMatrixEdit(row.id));
    },
    [navigate],
  );

  const handleView = useCallback(
    (row: RoleSummaryRow) => {
      navigate(paths.dashboard.permissionMatrixView(row.id));
    },
    [navigate],
  );

  const handleNew = useCallback(() => {
    navigate(paths.dashboard.permissionMatrixNew);
  }, [navigate]);

  const handleToggleStatus = useCallback(
    (row: RoleSummaryRow) => {
      setDeactivateRow(row);
    },
    [],
  );

  const handleConfirmToggle = useCallback(async () => {
    if (!deactivateRow) return;
    await updateRole({ id: deactivateRow.id, data: { isActive: !deactivateRow.isActive } });
    setDeactivateRow(null);
  }, [deactivateRow, updateRole]);

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
            { label: 'Edit', icon: 'solar:pen-bold', onClick: () => handleEdit(params.row as RoleSummaryRow) },
            { label: params.row.isActive ? 'Deactivate' : 'Activate', icon: params.row.isActive ? 'solar:forbidden-circle-bold' : 'solar:check-circle-bold', onClick: () => handleToggleStatus(params.row as RoleSummaryRow) },
            { label: 'View', icon: 'solar:eye-bold', onClick: () => handleView(params.row as RoleSummaryRow) },
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

      <Dialog open={!!deactivateRow} onClose={() => setDeactivateRow(null)} maxWidth="xs">
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to {deactivateRow?.isActive ? 'deactivate' : 'activate'} this role mapping?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeactivateRow(null)} color="inherit">Cancel</Button>
          <Button onClick={handleConfirmToggle} color="warning" variant="contained" disabled={isUpdating}>
            {isUpdating ? 'Updating...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

    </>
  );
}
