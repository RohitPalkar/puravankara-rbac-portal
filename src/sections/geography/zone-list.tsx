import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { queryKeys } from 'src/services/api/query-keys';
import { useDeleteZone } from 'src/services/hooks/use-geography';
import { zoneService } from 'src/services/services/geography.service';
import { useMyPermissions } from 'src/services/hooks/use-permissions';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { EmptyState } from 'src/components/empty-state';
import { RowActionsMenu } from 'src/components/row-actions';
import { PageHeader, PageContainer } from 'src/components/page-layout';
import { DataTable, type FilterOption } from 'src/components/data-table';

const PAGE_SIZE = 20;

const CHIP_PADDING = 26; // label px:1.5 (24) + border 1px each side (2)

const chipSx = {
  height: 32,
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 500,
  flexShrink: 0,
  border: '1px solid',
  borderColor: 'divider',
  '& .MuiChip-label': { px: 1.5 },
};

const overflowChipSx = {
  height: 32,
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 600,
  flexShrink: 0,
  color: '#fff',
  bgcolor: 'primary.main',
  cursor: 'pointer',
  '&:hover': { bgcolor: 'primary.dark' },
  '& .MuiChip-label': { px: 1.5 },
};

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

function CitiesChipCell({ cities }: { cities?: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measurerRef = useRef<((text: string, weight?: number) => number) | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        setContainerWidth(entry.contentRect.width);
      });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const measureText = useCallback((text: string, weight: number = 500): number => {
    if (!measurerRef.current) {
      const canvas = document.createElement('canvas');
      measurerRef.current = (t: string, w: number = 500) => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return t.length * 7.5;
        ctx.font = `${w} 13px "DM Sans", "Inter", "Public Sans", system-ui, sans-serif`;
        return ctx.measureText(t).width;
      };
    }
    return measurerRef.current(text, weight);
  }, []);

  const chipWidths = useMemo(() => {
    if (!cities) return [];
    return cities.map((name) => measureText(name, 500) + CHIP_PADDING);
  }, [cities, measureText]);

  const overflowChipWidth = useMemo(() => {
    if (!cities || cities.length === 0) return 0;
    const text = `+${cities.length}`;
    return measureText(text, 600) + CHIP_PADDING;
  }, [cities, measureText]);

  const { visible, remaining } = useMemo(() => {
    if (!cities || cities.length === 0 || containerWidth === 0) {
      return { visible: cities ?? [], remaining: [] };
    }

    const gap = 8;
    const totalWidth = chipWidths.reduce((sum, w, i) => sum + w + (i > 0 ? gap : 0), 0);

    if (totalWidth <= containerWidth) {
      return { visible: cities, remaining: [] };
    }

    let available = containerWidth - overflowChipWidth - gap;
    let count = 0;

    for (let i = 0; i < cities.length; i += 1) {
      const needed = chipWidths[i] + (i > 0 ? gap : 0);
      if (needed > available) break;
      available -= needed;
      count += 1;
    }

    if (count === 0) count = 1;

    return { visible: cities.slice(0, count), remaining: cities.slice(count) };
  }, [cities, containerWidth, chipWidths, overflowChipWidth]);

  if (!cities || cities.length === 0) return null;

  return (
    <Box ref={containerRef} sx={{ display: 'flex', alignItems: 'center', gap: 1, width: 1, overflow: 'hidden' }}>
      {visible.map((name) => (
        <Chip key={name} label={name} variant="outlined" sx={chipSx} />
      ))}
      {remaining.length > 0 && (
        <Tooltip
          title={
            <Box sx={{ maxHeight: 300, overflowY: 'auto', py: 0.5 }}>
              <Stack spacing={0.5}>
                {remaining.map((name) => (
                  <Typography key={name} variant="body2">{name}</Typography>
                ))}
              </Stack>
            </Box>
          }
          arrow
        >
          <Chip label={`+${remaining.length}`} sx={overflowChipSx} />
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
  const [statusFilter] = useState('');

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
    {
      field: 'name', headerName: 'Zone Name', flex: 1, minWidth: 180,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={500} sx={{ pl: 1.5 }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'citiesMapped', headerName: 'Cities Mapped', minWidth: 320, flex: 1,
      renderCell: (params) => <CitiesChipCell cities={params.value} />,
    },
    {
      field: 'salaryCapping', headerName: 'Salary Capping', width: 120,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={500} color="text.secondary">
          {params.row.salaryCappingLabel ?? `${params.value}x`}
        </Typography>
      ),
    },
    {
      field: 'isActive', headerName: 'Status', width: 100,
      renderCell: (params) => (
        <Label color={params.value ? 'success' : 'default'} sx={{ height: 32, px: 1.5 }}>
          {params.value ? 'Active' : 'Inactive'}
        </Label>
      ),
    },
    ...(canEdit || canDelete ? [{
      field: 'actions' as const, headerName: '', width: 64, sortable: false, disableColumnMenu: true,
      renderCell: (params: any) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 1 }}>
          <RowActionsMenu actions={[
            ...(canEdit ? [{ label: 'Edit', icon: 'solar:pen-bold' as const, onClick: () => navigate(paths.dashboard.zoneMasterEdit(params.row.id)) }] : []),
            ...(canDelete ? [{ label: 'Delete', icon: 'solar:trash-bin-trash-bold' as const, onClick: () => setDeleteId(params.row.id), color: 'error.main' as const }] : []),
          ]} />
        </Box>
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
              getRowHeight={() => 'auto'}
              dataGridSx={{
                '& .MuiDataGrid-row': { minHeight: '80px !important' },
                '& .MuiDataGrid-cell': {
                  py: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                },
                '& .MuiDataGrid-columnHeader': {
                  py: 1.5,
                  px: 2,
                },
                '& .MuiDataGrid-columnHeaderTitle': {
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  color: 'text.secondary',
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                },
              }}
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
