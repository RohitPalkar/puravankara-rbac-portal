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
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { CONFIG } from 'src/config-global';
import { DataTable, type FilterOption } from 'src/components/data-table';
import { EmptyState } from 'src/components/empty-state';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { RowActionsMenu } from 'src/components/row-actions';
import { PageContainer, PageHeader } from 'src/components/page-layout';
import { paths } from 'src/routes/paths';
import { queryKeys } from 'src/services/api/query-keys';
import { zoneService } from 'src/services/services/geography.service';
import { useDeleteZone } from 'src/services/hooks/use-geography';
import { useMyPermissions } from 'src/services/hooks/use-permissions';

const PAGE_SIZE = 20;
const MAX_VISIBLE_CITIES = 4;

function hasZonePermission(
  permissions: { projects: { modules: { subModules: { name: string; actions: { code: string; allowed: boolean }[] }[] }[] }[] } | undefined,
  action: string
): boolean {
  if (!permissions) return false;
  return permissions.projects.some((project) =>
    project.modules.some((mod) =>
      mod.subModules.some((sub) =>
        sub.name === 'ZONES' && sub.actions.some((a) => a.code === action && a.allowed)
      )
    )
  );
}

const chipSx = {
  height: 32,
  px: 0,
  borderRadius: '8px',
  border: '1px solid',
  borderColor: 'divider',
  fontSize: '14px',
  fontWeight: 500,
  '& .MuiChip-label': { px: 1.5 },
};

function CitiesChipCell({ cities }: { cities?: string[] }) {
  const visible = cities?.slice(0, MAX_VISIBLE_CITIES) ?? [];
  const remaining = cities?.slice(MAX_VISIBLE_CITIES) ?? [];

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', width: 1 }}>
      {visible.map((name) => (
        <Chip key={name} label={name} variant="outlined" sx={chipSx} />
      ))}
      {remaining.length > 0 && (
        <Tooltip
          title={
            <Stack spacing={0.3}>
              {remaining.map((name) => (
                <Typography key={name} variant="caption">{name}</Typography>
              ))}
            </Stack>
          }
          arrow
        >
          <Chip label={`+${remaining.length}`} sx={{ ...chipSx, bgcolor: 'action.hover', borderColor: 'divider' }} />
        </Tooltip>
      )}
    </Box>
  );
}

export default function ZoneListPage() {
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: PAGE_SIZE });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: permissions } = useMyPermissions();

  const canCreate = useMemo(() => hasZonePermission(permissions, 'CREATE'), [permissions]);
  const canEdit = useMemo(() => hasZonePermission(permissions, 'EDIT'), [permissions]);
  const canDelete = useMemo(() => hasZonePermission(permissions, 'DELETE'), [permissions]);

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
    queryKey: [...queryKeys.zones.list(queryParams as Record<string, unknown>)],
    queryFn: async () => {
      const res = await zoneService.list(queryParams as any);
      return { data: res.data, meta: res.meta };
    },
  });

  const zones = response?.data ?? [];
  const meta = response?.meta;

  const { mutateAsync: deleteZone, isPending: isDeleting } = useDeleteZone();

  const handleDelete = useCallback(async () => {
    if (deleteId === null) return;
    try {
      await deleteZone(deleteId);
      setDeleteId(null);
    } catch {
      // handled by query cache invalidation
    }
  }, [deleteId, deleteZone]);

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

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Zone Name', flex: 1, minWidth: 180 },
    {
      field: 'citiesMapped', headerName: 'Cities Mapped', minWidth: 320, flex: 1,
      renderCell: (params) => <CitiesChipCell cities={params.value} />,
    },
    {
      field: 'salaryCapping', headerName: 'Salary Capping', width: 130,
      renderCell: (params) => params.row.salaryCappingLabel ?? `${params.value}x`,
    },
    {
      field: 'isActive', headerName: 'Status', width: 90,
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
            ...(canEdit ? [{ label: 'Edit', icon: 'solar:pen-bold' as const, onClick: () => navigate(paths.dashboard.zoneMasterEdit(params.row.id)) }] : []),
            ...(canDelete ? [{ label: 'Delete', icon: 'solar:trash-bin-trash-bold' as const, onClick: () => setDeleteId(params.row.id), color: 'error.main' as const }] : []),
          ]} />
        </Stack>
      ),
    }] : []),
  ];

  return (
    <>
      <Helmet><title>Zones - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader title="Zones" description="Manage geographic zones and regions" action={
          canCreate ? (
            <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={() => navigate(paths.dashboard.zoneMasterCreate)}>
              Create Zone
            </Button>
          ) : null
        } />

        <Card sx={{ overflow: 'hidden' }}>
          {isError ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Alert severity="error">Failed to load zones: {(error as Error)?.message || 'Unknown error'}</Alert>
            </Box>
          ) : !isLoading && zones.length === 0 && !search ? (
            <EmptyState
              icon="solar:map-point-bold-duotone"
              title="No Zones Created"
              description="Create your first geographic zone to get started"
            />
          ) : (
            <DataTable
              columns={columns}
              rows={zones}
              getRowId={(r) => r.id}
              loading={isLoading}
              paginationMode="server"
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              rowCount={meta?.total ?? 0}
              onSearchChange={handleSearchChange}
              searchValue={search}
              searchPlaceholder="Search zones by name..."
              filterOptions={filterOptions}
              getRowHeight={() => 88}
            />
          )}
        </Card>
      </PageContainer>

      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)} maxWidth="xs">
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this zone?</DialogContent>
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
