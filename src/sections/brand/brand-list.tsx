import type { GridColDef, GridPaginationModel, GridColumnHeaderParams } from '@mui/x-data-grid';

import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { queryKeys } from 'src/services/api/query-keys';
import { useDeleteBrand } from 'src/services/hooks/use-brands';
import { brandService } from 'src/services/services/brand.service';
import { useMyPermissions } from 'src/services/hooks/use-permissions';

import { Iconify } from 'src/components/iconify';
import { DataTable } from 'src/components/data-table';
import { RowActionsMenu } from 'src/components/row-actions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { PageHeader, PageContainer } from 'src/components/page-layout';
import { PermissionChips } from 'src/components/permission-summary/permission-summary';

import { canAccess } from 'src/auth/utils/authorization';
import { useAuthContext } from 'src/auth/hooks/use-auth-context';

const PAGE_SIZE = 20;

const groupMap: Record<string, string> = {
  reraRegularizationPercentage: 'RERA',
  reraQualificationPercentage: 'RERA',
  rtmRegularizationPercentage: 'RTM',
  rtmQualificationPercentage: 'RTM',
};

const groupDividerFields = ['salaryMultiplier', 'reraQualificationPercentage', 'rtmQualificationPercentage'];

function renderBrandHeader(params: GridColumnHeaderParams) {
  const group = groupMap[params.field];
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: 1,
        height: 1,
        gap: 1,
      }}
    >
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: '0.75rem',
          lineHeight: 1.1,
          color: 'text.secondary',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        {group ?? ''}
      </Typography>
      <Typography
        sx={{
          fontWeight: 600,
          fontSize: '0.8125rem',
          lineHeight: 1.2,
          color: 'text.secondary',
          whiteSpace: 'nowrap',
          overflow: 'visible',
        }}
      >
        {params.colDef.headerName}
      </Typography>
    </Box>
  );
}

export default function BrandListPage() {
  const navigate = useNavigate();
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: PAGE_SIZE });
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { user: authUser } = useAuthContext();
  const { data: permissions } = useMyPermissions();

  const canCreate = useMemo(() => canAccess(authUser, permissions, 'BRANDS', 'CREATE'), [authUser, permissions]);
  const canEdit = useMemo(() => canAccess(authUser, permissions, 'BRANDS', 'EDIT') || canAccess(authUser, permissions, 'BRANDS', 'UPDATE'), [authUser, permissions]);
  const canDelete = useMemo(() => canAccess(authUser, permissions, 'BRANDS', 'DELETE'), [authUser, permissions]);

  const { mutateAsync: deleteBrand, isPending: isDeleting } = useDeleteBrand();

  const handleDelete = useCallback(async () => {
    if (deleteId === null) return;
    try {
      await deleteBrand(deleteId);
      setDeleteId(null);
    } catch {
      // handled by query cache invalidation
    }
  }, [deleteId, deleteBrand]);

  const queryParams = useMemo(() => {
    const params: Record<string, unknown> = {
      page: paginationModel.page + 1,
      limit: paginationModel.pageSize,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    };
    if (search) params.search = search;
    return params;
  }, [search, paginationModel]);

  const { data: response, isLoading, isError, error } = useQuery({
    queryKey: [...queryKeys.brands.list(queryParams as Record<string, unknown>)],
    queryFn: async () => {
      const res = await brandService.list(queryParams as any);
      return { data: res.data, meta: res.meta };
    },
  });

  const brands = response?.data ?? [];
  const meta = response?.meta;

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, []);

  const dividerSx = groupDividerFields.reduce((acc, field) => {
    acc[`& .MuiDataGrid-columnHeader[data-field="${field}"], & .MuiDataGrid-cell[data-field="${field}"]`] = {
      borderRight: '2px solid',
      borderColor: 'divider',
    };
    return acc;
  }, {} as Record<string, any>);

  const columns: GridColDef[] = [
    { field: 'brandName', headerName: 'Brand Name', flex: 4, minWidth: 220, renderHeader: renderBrandHeader },
    {
      field: 'salaryMultiplier',
      headerName: 'Salary Multiplier',
      flex: 2,
      minWidth: 160,
      renderHeader: renderBrandHeader,
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (value: number) => `${value}x`,
    },
    {
      field: 'reraRegularizationPercentage',
      headerName: 'Regularisation %',
      minWidth: 144,
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      renderHeader: renderBrandHeader,
      valueFormatter: (value: number | null) => (value != null ? `${value}%` : '—'),
    },
    {
      field: 'reraQualificationPercentage',
      headerName: 'Qualification',
      minWidth: 144,
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      renderHeader: renderBrandHeader,
      valueFormatter: (value: number | null) => (value != null ? `${value}%` : '—'),
    },
    {
      field: 'rtmRegularizationPercentage',
      headerName: 'Regularisation %',
      minWidth: 144,
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      renderHeader: renderBrandHeader,
      valueFormatter: (value: number | null) => (value != null ? `${value}%` : '—'),
    },
    {
      field: 'rtmQualificationPercentage',
      headerName: 'Qualification',
      minWidth: 144,
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      renderHeader: renderBrandHeader,
      valueFormatter: (value: number | null) => (value != null ? `${value}%` : '—'),
    },
    ...(canEdit || canDelete ? [{
      field: 'actions' as const, headerName: '', width: 64, sortable: false, disableColumnMenu: true,
      align: 'center' as const,
      renderHeader: renderBrandHeader,
      renderCell: (params: any) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 1 }}>
          <RowActionsMenu actions={[
            ...(canEdit ? [{ label: 'Edit', icon: 'solar:pen-bold' as const, onClick: () => navigate(paths.dashboard.brandMasterEdit(params.row.id)) }] : []),
            ...(canDelete ? [{ label: 'Delete', icon: 'solar:trash-bin-trash-bold' as const, onClick: () => setDeleteId(params.row.id), color: 'error.main' as const }] : []),
          ]} />
        </Box>
      ),
    }] : []),
  ];

  return (
    <>
      <Helmet><title>Brands - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader title="Brands" description="Manage brand entities" action={
          canCreate ? (
            <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={() => navigate(paths.dashboard.brandMasterCreate)}>
              Create Brand
            </Button>
          ) : null
        } />
        <Box sx={{ mb: 1.5 }}>
          <PermissionChips moduleName="BRANDS" />
        </Box>
        <DataTable
          columns={columns}
          rows={brands}
          getRowId={(r) => r.id}
          loading={isLoading}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          rowCount={meta?.total ?? 0}
          onSearchChange={handleSearchChange}
          searchValue={search}
          searchPlaceholder="Search by brand name"
          hideColumnsButton
          columnHeaderHeight={76}
          error={isError}
          errorMessage={`Failed to load brands: ${(error as Error)?.message || 'Unknown error'}`}
          emptyTitle="No Brands Created"
          emptyDescription="Create your first brand to get started with city and zone mapping"
          emptyIcon="solar:crown-bold-duotone"
          createAction={canCreate ? { icon: 'solar:add-circle-bold', label: 'Create Brand', onClick: () => navigate(paths.dashboard.brandMasterCreate) } : undefined}
          dataGridSx={dividerSx}
        />
      </PageContainer>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Brand"
        message="Are you sure you want to delete this brand? This action cannot be undone."
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}
