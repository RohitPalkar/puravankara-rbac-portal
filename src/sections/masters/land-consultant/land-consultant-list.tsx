import type { GridColDef } from '@mui/x-data-grid';

import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { useAllMasterCities, useLandConsultantList, useDeleteLandConsultant } from 'src/services/hooks/use-masters';

import { Iconify } from 'src/components/iconify';
import { DataTable } from 'src/components/data-table';
import { RowActionsMenu } from 'src/components/row-actions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { PageHeader, PageContainer } from 'src/components/page-layout';

export default function LandConsultantListPage() {
  const navigate = useNavigate();

  const { data: response, isLoading, isError, refetch } = useLandConsultantList();
  const { data: cities } = useAllMasterCities();
  const { mutateAsync: deleteConsultant, isPending: isDeleting } = useDeleteLandConsultant();

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const consultants = response?.data ?? [];

  const cityName = useCallback(
    (id: number | undefined) => cities?.find((c) => c.id === id)?.name ?? '—',
    [cities]
  );

  const handleDelete = useCallback(async () => {
    if (deleteId === null) return;
    try {
      await deleteConsultant(deleteId);
      setDeleteId(null);
    } catch {
      // handled by query cache invalidation
    }
  }, [deleteId, deleteConsultant]);

  const columns: GridColDef[] = useMemo(() => [
    { field: 'code', headerName: 'Code', width: 100 },
    { field: 'name', headerName: 'Consultant', flex: 1.6, minWidth: 180 },
    { field: 'contactPerson', headerName: 'Contact Person', flex: 1.2, minWidth: 140 },
    { field: 'mobile', headerName: 'Mobile', width: 130 },
    { field: 'specialisation', headerName: 'Specialisation', flex: 1.4, minWidth: 180 },
    {
      field: 'cityIds',
      headerName: 'Cities',
      flex: 1.6,
      minWidth: 170,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {(params.value ?? []).map((id: number) => (
            <Chip key={id} label={cityName(id)} size="small" variant="outlined" />
          ))}
        </Box>
      ),
    },
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
              { label: 'Edit', icon: 'solar:pen-bold', onClick: () => navigate(paths.dashboard.masters.consultantEdit(params.row.id)) },
              { label: 'Delete', icon: 'solar:trash-bin-trash-bold', onClick: () => setDeleteId(params.row.id), color: 'error.main' },
            ]}
          />
        </Box>
      ),
    },
  ], [navigate, cityName]);

  return (
    <>
      <Helmet><title>Land Consultants - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader
          title="Land Consultants"
          description="Manage land consultant master data"
          action={
            <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={() => navigate(paths.dashboard.masters.consultantCreate)}>
              Add Consultant
            </Button>
          }
        />
        <DataTable
          columns={columns}
          rows={consultants}
          loading={isLoading}
          error={isError}
          onErrorRetry={() => refetch()}
          errorMessage="Failed to load land consultants"
          searchPlaceholder="Search by name, code or contact"
          emptyTitle="No Consultants Added"
          emptyDescription="Add your first land consultant to get started"
          emptyIcon="solar:people-bold"
          createAction={{ icon: 'solar:add-circle-bold', label: 'Add Consultant', onClick: () => navigate(paths.dashboard.masters.consultantCreate) }}
        />
      </PageContainer>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Land Consultant"
        message="Are you sure you want to delete this land consultant? This action cannot be undone."
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}
