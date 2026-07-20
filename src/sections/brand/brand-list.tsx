import { useState, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import dayjs from 'dayjs';
import { CONFIG } from 'src/config-global';
import { DataTable, type FilterOption } from 'src/components/data-table';
import { EmptyState } from 'src/components/empty-state';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { RowActionsMenu } from 'src/components/row-actions';
import { PageContainer, PageHeader } from 'src/components/page-layout';
import { paths } from 'src/routes/paths';
import { queryKeys } from 'src/services/api/query-keys';
import { brandService } from 'src/services/services/brand.service';
import { useDeleteBrand } from 'src/services/hooks/use-brands';
import { useMyPermissions } from 'src/services/hooks/use-permissions';

const PAGE_SIZE = 20;

function hasBrandPermission(
  permissions: { projects: { modules: { subModules: { name: string; actions: { code: string; allowed: boolean }[] }[] }[] }[] } | undefined,
  action: string
): boolean {
  if (!permissions) return false;
  return permissions.projects.some((project) =>
    project.modules.some((mod) =>
      mod.subModules.some((sub) =>
        sub.name === 'BRANDS' && sub.actions.some((a) => a.code === action && a.allowed)
      )
    )
  );
}

export default function BrandListPage() {
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: PAGE_SIZE });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // eslint-disable-line @typescript-eslint/no-unused-vars

  const { data: permissions } = useMyPermissions();

  const canCreate = useMemo(() => hasBrandPermission(permissions, 'CREATE'), [permissions]);
  const canEdit = useMemo(() => hasBrandPermission(permissions, 'EDIT'), [permissions]);
  const canDelete = useMemo(() => hasBrandPermission(permissions, 'DELETE'), [permissions]);

  const queryParams = useMemo(() => {
    const params: Record<string, unknown> = {
      page: paginationModel.page + 1,
      limit: paginationModel.pageSize,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    };
    if (search) params.search = search;
    if (statusFilter) params.isActive = statusFilter === 'active';
    return params;
  }, [search, statusFilter, paginationModel]);

  const { data: response, isLoading, isError, error } = useQuery({
    queryKey: [...queryKeys.brands.list(queryParams as Record<string, unknown>)],
    queryFn: async () => {
      const res = await brandService.list(queryParams as any);
      return { data: res.data, meta: res.meta };
    },
  });

  const brands = response?.data ?? [];
  const meta = response?.meta;

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

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, []);

  const handleFiltersChange = useCallback((filters: Record<string, string>) => {
    setStatusFilter(filters.isActive ?? '');
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, []);

  const filterOptions: FilterOption[] = [
    {
      key: 'isActive',
      label: 'Status',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ],
    },
  ];

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 60 },
    { field: 'brandName', headerName: 'Brand Name', flex: 1, minWidth: 160 },
    { field: 'billingName', headerName: 'Billing Name', width: 200 },
    { field: 'city', headerName: 'City', width: 130 },
    { field: 'state', headerName: 'State', width: 130 },
    {
      field: 'salaryMultiplier', headerName: 'Salary Mult.', width: 110,
      valueFormatter: (value: number) => `${value}x`,
    },
    {
      field: 'isActive', headerName: 'Status', width: 100,
      renderCell: (params) => (
        <Label color={params.value ? 'success' : 'default'}>
          {params.value ? 'Active' : 'Inactive'}
        </Label>
      ),
    },
    {
      field: 'createdAt', headerName: 'Created Date', width: 130,
      valueFormatter: (value) => value ? dayjs(value).format('DD MMM YYYY') : '-',
    },
    ...(canEdit || canDelete ? [{
      field: 'actions' as const, headerName: '', width: 60, sortable: false, disableColumnMenu: true,
      renderCell: (params: any) => (
        <Stack alignItems="center" sx={{ height: 1, justifyContent: 'center' }}>
          <RowActionsMenu actions={[
            ...(canEdit ? [{ label: 'Edit', icon: 'solar:pen-bold' as const, onClick: () => navigate(paths.dashboard.brandMasterEdit(params.row.id)) }] : []),
            ...(canDelete ? [{ label: 'Delete', icon: 'solar:trash-bin-trash-bold' as const, onClick: () => setDeleteId(params.row.id), color: 'error.main' as const }] : []),
          ]} />
        </Stack>
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
        <Card sx={{ overflow: 'hidden' }}>
          {isError ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Alert severity="error">Failed to load brands: {(error as Error)?.message || 'Unknown error'}</Alert>
            </Box>
          ) : !isLoading && brands.length === 0 && !search ? (
            <EmptyState
              icon="solar:crown-bold-duotone"
              title="No Brands Created"
              description="Create your first brand to get started"
            />
          ) : (
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
              searchPlaceholder="Search brands by name..."
              filterOptions={filterOptions}
              onFiltersChange={handleFiltersChange}
            />
          )}
        </Card>
      </PageContainer>

      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)} maxWidth="xs">
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this brand?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} color="inherit">Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
