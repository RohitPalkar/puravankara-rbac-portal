import type { GridColDef } from '@mui/x-data-grid';

import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { useMasterDepartmentList, useDeleteMasterDepartment } from 'src/services/hooks/use-masters';

import { Iconify } from 'src/components/iconify';
import { DataTable } from 'src/components/data-table';
import { RowActionsMenu } from 'src/components/row-actions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { PageHeader, PageContainer } from 'src/components/page-layout';

export default function MasterDepartmentListPage() {
  const navigate = useNavigate();

  const { data: response, isLoading, isError, refetch } = useMasterDepartmentList();
  const { mutateAsync: deleteDepartment, isPending: isDeleting } = useDeleteMasterDepartment();

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const departments = response?.data ?? [];

  const handleDelete = useCallback(async () => {
    if (deleteId === null) return;
    try {
      await deleteDepartment(deleteId);
      setDeleteId(null);
    } catch {
      // handled by query cache invalidation
    }
  }, [deleteId, deleteDepartment]);

  const columns: GridColDef[] = useMemo(() => [
    { field: 'code', headerName: 'Code', width: 110 },
    { field: 'name', headerName: 'Department', flex: 1.4, minWidth: 180 },
    { field: 'description', headerName: 'Description', flex: 2.4, minWidth: 260 },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 110,
      renderCell: (params) => (
        <Chip label={params.row.isActive ? 'Active' : 'Inactive'} size="small" color={params.row.isActive ? 'success' : 'default'} />
      ),
    },
    {
      field: 'actions',
      headerName: '',
      width: 64,
      sortable: false,
      align: 'center',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 1 }}>
          <RowActionsMenu
            actions={[
              { label: 'Edit', icon: 'solar:pen-bold', onClick: () => navigate(paths.dashboard.masters.departmentEdit(params.row.id)) },
              { label: 'Delete', icon: 'solar:trash-bin-trash-bold', onClick: () => setDeleteId(params.row.id), color: 'error.main' },
            ]}
          />
        </Box>
      ),
    },
  ], [navigate]);

  return (
    <>
      <Helmet><title>Departments - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader
          title="Departments"
          description="Manage department master data"
          action={
            <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={() => navigate(paths.dashboard.masters.departmentCreate)}>
              Add Department
            </Button>
          }
        />
        <DataTable
          columns={columns}
          rows={departments}
          loading={isLoading}
          error={isError}
          onErrorRetry={() => refetch()}
          errorMessage="Failed to load departments"
          searchPlaceholder="Search by department, code or description"
          emptyTitle="No Departments Added"
          emptyDescription="Add your first department to get started"
          emptyIcon="solar:building-bold"
          createAction={{ icon: 'solar:add-circle-bold', label: 'Add Department', onClick: () => navigate(paths.dashboard.masters.departmentCreate) }}
        />
      </PageContainer>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Department"
        message="Are you sure you want to delete this department? This action cannot be undone."
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}
