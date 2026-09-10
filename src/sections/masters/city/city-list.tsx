import type { GridColDef } from '@mui/x-data-grid';

import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { useMasterCityList, useDeleteMasterCity } from 'src/services/hooks/use-masters';

import { Iconify } from 'src/components/iconify';
import { DataTable } from 'src/components/data-table';
import { RowActionsMenu } from 'src/components/row-actions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { PageHeader, PageContainer } from 'src/components/page-layout';

export default function MasterCityListPage() {
  const navigate = useNavigate();

  const { data: response, isLoading, isError, refetch } = useMasterCityList();
  const { mutateAsync: deleteCity, isPending: isDeleting } = useDeleteMasterCity();

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const cities = response?.data ?? [];

  const handleDelete = useCallback(async () => {
    if (deleteId === null) return;
    try {
      await deleteCity(deleteId);
      setDeleteId(null);
    } catch {
      // handled by query cache invalidation
    }
  }, [deleteId, deleteCity]);

  const columns: GridColDef[] = useMemo(() => [
    { field: 'code', headerName: 'Code', width: 120 },
    { field: 'name', headerName: 'City', flex: 2, minWidth: 180 },
    { field: 'state', headerName: 'State', flex: 2, minWidth: 160 },
    { field: 'country', headerName: 'Country', flex: 1.5, minWidth: 120 },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.row.isActive ? 'Active' : 'Inactive'}
          size="small"
          color={params.row.isActive ? 'success' : 'default'}
        />
      ),
    },
    {
      field: 'genericApprovals',
      headerName: 'Approvals',
      width: 110,
      renderCell: (params) => {
        const count = (params.row.genericApprovals?.length ?? 0);
        return <Chip label={`${count} approvals`} size="small" variant={count ? 'filled' : 'outlined'} color={count ? 'primary' : 'default'} />;
      },
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
              { label: 'View (User)', icon: 'solar:eye-bold', onClick: () => navigate(paths.dashboard.masters.cityView(params.row.id)) },
              { label: 'Edit (Admin)', icon: 'solar:pen-bold', onClick: () => navigate(paths.dashboard.masters.cityEdit(params.row.id)) },
              { label: 'Delete', icon: 'solar:trash-bin-trash-bold', onClick: () => setDeleteId(params.row.id), color: 'error.main' },
            ]}
          />
        </Box>
      ),
    },
  ], [navigate]);

  return (
    <>
      <Helmet><title>Cities - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader
          title="Cities"
          description="Manage city master data"
          action={
            <Button
              variant="contained"
              startIcon={<Iconify icon="solar:add-circle-bold" />}
              onClick={() => navigate(paths.dashboard.masters.cityCreate)}
            >
              Add City
            </Button>
          }
        />
        <DataTable
          columns={columns}
          rows={cities}
          loading={isLoading}
          error={isError}
          onErrorRetry={() => refetch()}
          errorMessage="Failed to load cities"
          searchPlaceholder="Search by city, state or code"
          emptyTitle="No Cities Created"
          emptyDescription="Create your first city to get started"
          emptyIcon="solar:map-bold"
          createAction={{ icon: 'solar:add-circle-bold', label: 'Add City', onClick: () => navigate(paths.dashboard.masters.cityCreate) }}
        />
      </PageContainer>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete City"
        message="Are you sure you want to delete this city? This action cannot be undone."
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}
