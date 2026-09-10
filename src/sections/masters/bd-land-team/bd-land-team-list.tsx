import type { GridColDef } from '@mui/x-data-grid';

import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { useBDLandTeamList, useAllMasterCities, useDeleteBDLandTeamMember } from 'src/services/hooks/use-masters';

import { Iconify } from 'src/components/iconify';
import { DataTable } from 'src/components/data-table';
import { RowActionsMenu } from 'src/components/row-actions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { PageHeader, PageContainer } from 'src/components/page-layout';

export default function BDLandTeamListPage() {
  const navigate = useNavigate();

  const { data: response, isLoading, isError, refetch } = useBDLandTeamList();
  const { data: cities } = useAllMasterCities();
  const { mutateAsync: deleteMember, isPending: isDeleting } = useDeleteBDLandTeamMember();

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const members = response?.data ?? [];

  const cityName = useCallback((id: number | undefined) => cities?.find((c) => c.id === id)?.name ?? '—', [cities]);

  const handleDelete = useCallback(async () => {
    if (deleteId === null) return;
    try {
      await deleteMember(deleteId);
      setDeleteId(null);
    } catch {
      // handled by query cache invalidation
    }
  }, [deleteId, deleteMember]);

  const columns: GridColDef[] = useMemo(() => [
    { field: 'empId', headerName: 'Emp ID', width: 110 },
    { field: 'name', headerName: 'Employee Name', flex: 1.4, minWidth: 170 },
    { field: 'designation', headerName: 'Designation', flex: 1.2, minWidth: 150 },
    { field: 'department', headerName: 'Department', flex: 1.4, minWidth: 160 },
    {
      field: 'cityIds',
      headerName: 'Cities',
      flex: 1.5,
      minWidth: 160,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {(params.value ?? []).map((cityId: number) => (
            <Chip key={cityId} label={cityName(cityId)} size="small" variant="outlined" />
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
              { label: 'Edit', icon: 'solar:pen-bold', onClick: () => navigate(paths.dashboard.masters.teamMemberEdit(params.row.id)) },
              { label: 'Delete', icon: 'solar:trash-bin-trash-bold', onClick: () => setDeleteId(params.row.id), color: 'error.main' },
            ]}
          />
        </Box>
      ),
    },
  ], [navigate, cityName]);

  return (
    <>
      <Helmet><title>BD &amp; Land Team - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader
          title="BD & Land Team"
          description="Manage business development and land team members"
          action={
            <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={() => navigate(paths.dashboard.masters.teamMemberCreate)}>
              Add Member
            </Button>
          }
        />
        <DataTable
          columns={columns}
          rows={members}
          loading={isLoading}
          error={isError}
          onErrorRetry={() => refetch()}
          errorMessage="Failed to load team members"
          searchPlaceholder="Search by name, emp id or designation"
          emptyTitle="No Team Members Added"
          emptyDescription="Add your first BD & Land team member to get started"
          emptyIcon="solar:users-group-rounded-bold"
          createAction={{ icon: 'solar:add-circle-bold', label: 'Add Member', onClick: () => navigate(paths.dashboard.masters.teamMemberCreate) }}
        />
      </PageContainer>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Team Member"
        message="Are you sure you want to delete this team member? This action cannot be undone."
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}
