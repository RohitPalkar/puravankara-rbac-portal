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
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Popover from '@mui/material/Popover';
import { CONFIG } from 'src/config-global';
import { DataTable, type FilterOption } from 'src/components/data-table';
import { EmptyState } from 'src/components/empty-state';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { RowActionsMenu } from 'src/components/row-actions';
import { PageContainer, PageHeader } from 'src/components/page-layout';
import { paths } from 'src/routes/paths';
import { queryKeys } from 'src/services/api/query-keys';
import { departmentService } from 'src/services/services/organization.service';
import { useDeleteDepartment } from 'src/services/hooks/use-organization';
import { useMyPermissions } from 'src/services/hooks/use-permissions';

const PAGE_SIZE = 20;
const MAX_ZONE_CHIPS = 3;

const chipSx = {
  height: 32,
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 500,
  border: '1px solid',
  borderColor: 'divider',
  '& .MuiChip-label': { px: 1.5 },
};

const overflowChipSx = {
  height: 32,
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 600,
  color: '#fff',
  bgcolor: 'primary.main',
  cursor: 'pointer',
  '&:hover': { bgcolor: 'primary.dark' },
  '& .MuiChip-label': { px: 1.5 },
};

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
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: PAGE_SIZE });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: permissions } = useMyPermissions();

  const canCreate = useMemo(() => hasDepartmentPermission(permissions, 'CREATE'), [permissions]);
  const canEdit = useMemo(() => hasDepartmentPermission(permissions, 'EDIT'), [permissions]);
  const canDelete = useMemo(() => hasDepartmentPermission(permissions, 'DELETE'), [permissions]);

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
    try {
      await deleteDepartment(deleteId);
      setDeleteId(null);
    } catch {
      // handled by query cache invalidation
    }
  }, [deleteId, deleteDepartment]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
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

function ZoneChipCell({ zones }: { zones?: string[] }) {
  const visible = zones?.slice(0, MAX_ZONE_CHIPS) ?? [];
  const remaining = zones?.slice(MAX_ZONE_CHIPS) ?? [];
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', width: 1 }}>
      {visible.map((name) => (
        <Chip key={name} label={name} variant="outlined" sx={chipSx} />
      ))}
      {remaining.length > 0 && (
        <>
          <Chip label={`+${remaining.length}`} sx={overflowChipSx} onClick={handleClick} />
          <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            slotProps={{ paper: { sx: { p: 1.5, minWidth: 160, maxHeight: 240 } } }}
          >
            <Stack spacing={0.5}>
              {remaining.map((name) => (
                <Typography key={name} variant="body2">{name}</Typography>
              ))}
            </Stack>
          </Popover>
        </>
      )}
      {(zones?.length ?? 0) === 0 && <span style={{ color: '#999' }}>—</span>}
    </Box>
  );
}

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Department Name', flex: 1, minWidth: 180 },
    {
      field: 'zones',
      headerName: 'Zones',
      width: 240,
      renderCell: (params) => <ZoneChipCell zones={params.value} />,
    },
    {
      field: 'levels',
      headerName: 'Levels',
      width: 80,
      renderCell: (params) => (
        <Chip label={params.value ?? params.row.maxHierarchyLevels} sx={chipSx} />
      ),
    },
    {
      field: 'departmentAdminId',
      headerName: 'Department Admin',
      width: 170,
      renderCell: (params) => params.value ?? '—',
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Label color={params.value ? 'success' : 'default'}>
          {params.value ? 'Active' : 'Inactive'}
        </Label>
      ),
    },
    ...(canEdit || canDelete ? [{
      field: 'actions' as const, headerName: '', width: 60, sortable: false, disableColumnMenu: true,
      renderCell: (params: any) => (
        <Stack alignItems="center" sx={{ height: 1, justifyContent: 'center' }}>
          <RowActionsMenu actions={[
            ...(canEdit ? [{ label: 'Edit', icon: 'solar:pen-bold' as const, onClick: () => navigate(paths.dashboard.departmentMasterEdit(params.row.id)) }] : []),
            ...(canDelete ? [{ label: 'Delete', icon: 'solar:trash-bin-trash-bold' as const, onClick: () => setDeleteId(params.row.id), color: 'error.main' as const }] : []),
          ]} />
        </Stack>
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
        <Card sx={{ overflow: 'hidden' }}>
          {isError ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Alert severity="error">Failed to load departments: {(error as Error)?.message || 'Unknown error'}</Alert>
            </Box>
          ) : !isLoading && departments.length === 0 && !search ? (
            <EmptyState
              icon="solar:buildings-bold-duotone"
              title="No Departments Created"
              description="Create your first department to get started"
            />
          ) : (
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
              searchPlaceholder="Search departments by name..."
              filterOptions={filterOptions}
            />
          )}
        </Card>
      </PageContainer>

      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)} maxWidth="xs">
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this department?</DialogContent>
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
