import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { queryKeys } from 'src/services/api/query-keys';
import { useMyPermissions } from 'src/services/hooks/use-permissions';
import { zoneService } from 'src/services/services/geography.service';
import { useDeleteDepartment } from 'src/services/hooks/use-organization';
import { departmentService } from 'src/services/services/organization.service';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { RowActionsMenu } from 'src/components/row-actions';
import { PageHeader, PageContainer } from 'src/components/page-layout';
import { DataTable, type FilterOption } from 'src/components/data-table';

const PAGE_SIZE = 20;

function hasDepartmentPermission(
  permissions: { projects: { modules: { subModules: { name: string; actions: { code: string; allowed: boolean }[] }[] }[] }[] } | undefined,
  action: string
): boolean {
  if (!permissions) return false;
  return permissions.projects.some((project) =>
    project.modules.some((mod) =>
      mod.subModules.some((sub) =>
        sub.name === 'DEPARTMENTS' && sub.actions.some((a) => a.code === action && a.allowed)
      )
    )
  );
}

export default function DepartmentListPage() {
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: PAGE_SIZE });
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});

  const { data: permissions } = useMyPermissions();

  const canCreate = useMemo(() => hasDepartmentPermission(permissions, 'CREATE'), [permissions]);
  const canEdit = useMemo(() => hasDepartmentPermission(permissions, 'EDIT'), [permissions]);
  const canDelete = useMemo(() => hasDepartmentPermission(permissions, 'DELETE'), [permissions]);

  const { data: zones } = useQuery({
    queryKey: queryKeys.zones.list({}),
    queryFn: async () => {
      const res = await zoneService.list({});
      return (res.data ?? []) as any[];
    },
  });

  const zoneOptions = useMemo(
    () => (zones ?? [])
      .filter((z: any) => z.isActive !== false)
      .sort((a: any, b: any) => a.name.localeCompare(b.name))
      .map((z: any) => ({ value: String(z.id), label: z.name })),
    [zones],
  );

  const queryParams = useMemo(() => {
    const params: Record<string, unknown> = {
      page: paginationModel.page + 1,
      limit: paginationModel.pageSize,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    };
    if (search) params.search = search;
    if (filters.zoneId) params.zoneId = Number(filters.zoneId);
    if (filters.isActive) params.isActive = filters.isActive === 'active';
    return params;
  }, [search, filters, paginationModel]);

  const { data: response, isLoading, isError, error } = useQuery({
    queryKey: [...queryKeys.departments.list(queryParams as Record<string, unknown>)],
    queryFn: async () => {
      const res = await departmentService.list(queryParams as any);
      return { data: res.data, meta: res.meta };
    },
  });

  const departments = response?.data ?? [];
  const meta = response?.meta;

  const { mutateAsync: deleteDepartment, isPending: isDeleting } = useDeleteDepartment();

  const handleDelete = useCallback(async () => {
    if (deleteId === null) return;
    setDeleteError('');
    try {
      await deleteDepartment(deleteId);
      setDeleteId(null);
    } catch (err: any) {
      const msg = err?.response?.data?.message?.[0] || err?.response?.data?.message || err?.message || 'Failed to delete department';
      setDeleteError(msg);
    }
  }, [deleteId, deleteDepartment]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, []);

  const handleFiltersChange = useCallback((newFilters: Record<string, string>) => {
    setFilters(newFilters);
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
    {
      key: 'zoneId',
      label: 'Zone',
      options: zoneOptions,
    },
  ];

  const columns: GridColDef[] = [
    {
      field: 'zoneName',
      headerName: 'Zone',
      flex: 1.5,
      minWidth: 120,
      renderCell: (params) => (
        <Chip
          label={params.value || '—'}
          variant="outlined"
          size="small"
          sx={{ height: 28, borderRadius: '6px', fontSize: '13px', fontWeight: 500 }}
        />
      ),
    },
    {
      field: 'name',
      headerName: 'Department Name',
      flex: 3,
      minWidth: 150,
      renderCell: (params) => (
        <Typography
          variant="body2"
          noWrap
          sx={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 1 }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'levels',
      headerName: 'Levels',
      flex: 1,
      minWidth: 80,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const val = params.value ?? params.row.maxHierarchyLevels;
        return (
          <Typography variant="body2" fontWeight={600}>
            {val}
          </Typography>
        );
      },
    },
    {
      field: 'departmentAdminId',
      headerName: 'Department Admin',
      flex: 2,
      minWidth: 160,
      renderCell: (params) => (
        <Typography variant="body2" noWrap sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {params.value || '—'}
        </Typography>
      ),
    },
    {
      field: 'isActive',
      headerName: 'Status',
      flex: 1,
      minWidth: 90,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Label color={params.value ? 'success' : 'default'} sx={{ height: 32, px: 1.5 }}>
          {params.value ? 'Active' : 'Inactive'}
        </Label>
      ),
    },
    ...(canEdit || canDelete ? [{
      field: 'actions' as const,
      headerName: '',
      width: 64,
      sortable: false,
      disableColumnMenu: true,
      align: 'center' as const,
      renderCell: (params: any) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 1 }}>
          <RowActionsMenu actions={[
            ...(canEdit ? [{ label: 'Edit', icon: 'solar:pen-bold' as const, onClick: () => navigate(paths.dashboard.departmentMasterEdit(params.row.id)) }] : []),
            ...(canDelete ? [{ label: 'Delete', icon: 'solar:trash-bin-trash-bold' as const, onClick: () => setDeleteId(params.row.id), color: 'error.main' as const }] : []),
          ]} />
        </Box>
      ),
    }] : []),
  ];

  return (
    <>
      <Helmet><title>Departments - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader title="Departments" description="Manage organizational departments and hierarchy levels" action={
          canCreate ? (
            <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={() => navigate(paths.dashboard.departmentMasterCreate)}>
              Add Department
            </Button>
          ) : null
        } />
        <DataTable
          columns={columns}
          rows={departments}
          getRowId={(r) => r.id}
          loading={isLoading}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          rowCount={meta?.total ?? 0}
          onSearchChange={handleSearchChange}
          searchValue={search}
          searchPlaceholder="Search departments by name or zone..."
          filterOptions={filterOptions}
          onFiltersChange={handleFiltersChange}
          error={isError}
          errorMessage={`Failed to load departments: ${(error as Error)?.message || 'Unknown error'}`}
          emptyTitle="No Departments Created"
          emptyDescription="Create your first department to get started"
          emptyIcon="solar:buildings-bold-duotone"
        />
      </PageContainer>

      <Dialog open={deleteId !== null} onClose={() => { setDeleteId(null); setDeleteError(''); }} maxWidth="xs">
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: deleteError ? 2 : 0 }}>Are you sure you want to delete this department?</Typography>
          {deleteError && <Alert severity="error" onClose={() => setDeleteError('')}>{deleteError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDeleteId(null); setDeleteError(''); }} color="inherit">Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}