import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import type { DeleteImpactResult } from 'src/services/types/organization';

import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useMemo, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { queryKeys } from 'src/services/api/query-keys';
import { useMyPermissions } from 'src/services/hooks/use-permissions';
import { zoneService } from 'src/services/services/geography.service';
import { departmentService } from 'src/services/services/organization.service';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { RowActionsMenu } from 'src/components/row-actions';
import { PageHeader, PageContainer } from 'src/components/page-layout';
import { DataTable, type FilterOption } from 'src/components/data-table';

const PAGE_SIZE = 20;

const ZONE_BADGE_COLORS: Record<string, string> = {
  West: '#1976D2',
  East: '#388E3C',
  North: '#F57C00',
  South: '#7B1FA2',
};

const ZONE_BADGE_BG: Record<string, string> = {
  West: '#1976D214',
  East: '#388E3C14',
  North: '#F57C0014',
  South: '#7B1FA214',
};

const DEFAULT_BADGE_COLOR = '#607D8B';

function ZoneBadge({ name }: { name: string }) {
  const color = ZONE_BADGE_COLORS[name] || DEFAULT_BADGE_COLOR;
  const bg = ZONE_BADGE_BG[name] || `${DEFAULT_BADGE_COLOR}14`;
  return (
    <Chip
      label={name}
      size="small"
      sx={{
        height: 26,
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: 600,
        color,
        bgcolor: bg,
        border: 'none',
        minWidth: 64,
        justifyContent: 'center',
      }}
    />
  );
}

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

function KpiCard({ icon, label, value, color, loading }: { icon: string; label: string; value: number | string; color: string; loading: boolean }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 1.5 }}>
      <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: `${color}14`,
              }}
            >
              <Iconify icon={icon} width={18} sx={{ color }} />
            </Box>
          </Stack>
          {loading ? <Skeleton width={80} height={32} /> : (
            <Typography variant="h3" sx={{ fontWeight: 700, lineHeight: 1.1 }}>{value}</Typography>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>{label}</Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function DepartmentListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleteImpact, setDeleteImpact] = useState<DeleteImpactResult | null>(null);
  const [isCheckingImpact, setIsCheckingImpact] = useState(false);
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [mergeTargetId, setMergeTargetId] = useState<number | ''>('');
  const [mergeError, setMergeError] = useState('');
  const [isMerging, setIsMerging] = useState(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: PAGE_SIZE });
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});

  const { data: permissions } = useMyPermissions();

  const canCreate = useMemo(() => hasDepartmentPermission(permissions, 'CREATE'), [permissions]);
  const canEdit = useMemo(() => hasDepartmentPermission(permissions, 'EDIT') || hasDepartmentPermission(permissions, 'UPDATE'), [permissions]);
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
      sortBy: 'zoneName',
      sortOrder: 'ASC',
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

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['departments', 'stats'],
    queryFn: async () => {
      const res = await departmentService.stats();
      return res.data;
    },
  });

  const departments = useMemo(() => response?.data ?? [], [response?.data]);
  const meta = response?.meta;

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await departmentService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['departments', 'stats'] });
    },
  });

  const handleInitiateDelete = useCallback(async (id: number) => {
    setDeleteId(id);
    setDeleteError('');
    setDeleteImpact(null);
    setMergeTargetId('');
    setMergeError('');
    setIsCheckingImpact(true);
    try {
      const res = await departmentService.deleteImpact(id);
      setDeleteImpact(res.data);
    } catch (err: any) {
      setDeleteError(err?.response?.data?.message?.[0] || err?.response?.data?.message || err?.message || 'Failed to check dependencies');
    } finally {
      setIsCheckingImpact(false);
    }
  }, []);

  const handleDirectDelete = useCallback(async () => {
    if (deleteId === null) return;
    setDeleteError('');
    try {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
      setDeleteImpact(null);
    } catch (err: any) {
      const msg = err?.response?.data?.message?.[0] || err?.response?.data?.message || err?.message || 'Failed to delete department';
      setDeleteError(msg);
    }
  }, [deleteId, deleteMutation]);

  const handleOpenMerge = useCallback(() => {
    setShowMergeDialog(true);
  }, []);

  const handleMerge = useCallback(async () => {
    if (deleteId === null || !mergeTargetId) return;
    setMergeError('');
    setIsMerging(true);
    try {
      await departmentService.removeWithMerge(deleteId, Number(mergeTargetId));
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['departments', 'stats'] });
      setDeleteId(null);
      setDeleteImpact(null);
      setShowMergeDialog(false);
      setMergeTargetId('');
    } catch (err: any) {
      const msg = err?.response?.data?.message?.[0] || err?.response?.data?.message || err?.message || 'Failed to merge department';
      setMergeError(msg);
    } finally {
      setIsMerging(false);
    }
  }, [deleteId, mergeTargetId, queryClient]);

  const handleCloseDelete = useCallback(() => {
    setDeleteId(null);
    setDeleteImpact(null);
    setDeleteError('');
    setMergeTargetId('');
    setMergeError('');
    setShowMergeDialog(false);
  }, []);

  const mergeCandidates = useMemo(() => {
    if (!deleteImpact || !departments) return [];
    return departments.filter(
      (d: any) =>
        d.id !== deleteImpact.departmentId &&
        d.zoneId === deleteImpact.zoneId &&
        d.isActive,
    );
  }, [deleteImpact, departments]);

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

  const kpiItems = useMemo(() => [
    { icon: 'solar:buildings-bold', label: 'Departments', value: statsData?.total ?? '-', color: '#2F3C98' },
    { icon: 'solar:shield-check-bold', label: 'Active', value: statsData?.active ?? '-', color: '#388E3C' },
    { icon: 'solar:shield-minimalistic-bold', label: 'Inactive', value: statsData?.inactive ?? '-', color: '#9E9E9E' },
    { icon: 'solar:map-point-bold', label: 'Zones Covered', value: statsData?.zonesCovered ?? '-', color: '#00BCD4' },
  ], [statsData]);

  const columns: GridColDef[] = [
    {
      field: 'zoneName',
      headerName: 'Zone',
      flex: 1.2,
      minWidth: 110,
      renderCell: (params) => <ZoneBadge name={params.value || '—'} />,
    },
    {
      field: 'name',
      headerName: 'Department Name',
      flex: 2.5,
      minWidth: 160,
      renderCell: (params) => (
        <Typography variant="body2" noWrap sx={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 1, fontWeight: 500 }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'roleCount',
      headerName: 'Role Count',
      flex: 0.8,
      minWidth: 90,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600} color={params.value ? 'text.primary' : 'text.disabled'}>
          {params.value ?? 0}
        </Typography>
      ),
    },
    {
      field: 'userCount',
      headerName: 'User Count',
      flex: 0.8,
      minWidth: 90,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600} color={params.value ? 'text.primary' : 'text.disabled'}>
          {params.value ?? 0}
        </Typography>
      ),
    },
    {
      field: 'isActive',
      headerName: 'Status',
      flex: 0.7,
      minWidth: 80,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Label color={params.value ? 'success' : 'default'} sx={{ height: 28, px: 1.5, fontSize: '12px' }}>
          {params.value ? 'Active' : 'Inactive'}
        </Label>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created On',
      flex: 1.2,
      minWidth: 120,
      renderCell: (params) => {
        if (!params.value) return <Typography variant="body2" color="text.disabled">—</Typography>;
        const d = new Date(params.value);
        return (
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '13px' }}>
            {d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </Typography>
        );
      },
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
            ...(canDelete ? [{ label: 'Delete', icon: 'solar:trash-bin-trash-bold' as const, onClick: () => handleInitiateDelete(params.row.id), color: 'error.main' as const }] : []),
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

        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            {kpiItems.map((item) => (
              <Grid item xs={6} sm={3} key={item.label}>
                <KpiCard {...item} loading={statsLoading} />
              </Grid>
            ))}
          </Grid>
        </Box>

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
          emptyDescription="Create your first department to assign roles and manage users by zone"
          emptyIcon="solar:buildings-bold-duotone"
          createAction={canCreate ? { icon: 'solar:add-circle-bold', label: 'Add Department', onClick: () => navigate(paths.dashboard.departmentMasterCreate) } : undefined}
        />
      </PageContainer>

      {/* Delete / Merge Dialog */}
      <Dialog open={deleteId !== null} onClose={handleCloseDelete} maxWidth="sm" fullWidth>
        <DialogTitle>
          {deleteImpact?.hasDependencies ? 'Impact Analysis' : 'Delete Department'}
        </DialogTitle>
        <DialogContent>
          {isCheckingImpact ? (
            <Box sx={{ py: 3 }}>
              <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1, mb: 2 }} />
              <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
            </Box>
          ) : (
            <>
              {deleteImpact && (
                <>
                  <Alert severity={deleteImpact.hasDependencies ? 'warning' : 'info'} sx={{ mb: 2 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {deleteImpact.departmentName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Zone: {deleteImpact.zoneName}
                    </Typography>
                  </Alert>

                  <Typography variant="subtitle2" sx={{ mb: 1.5 }}>Dependencies</Typography>

                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
                    {[
                      { label: 'Users', value: deleteImpact.dependencies.users, icon: 'solar:users-group-rounded-bold', color: '#2F3C98' },
                      { label: 'Roles', value: deleteImpact.dependencies.roles, icon: 'solar:user-id-bold', color: '#7B1FA2' },
                      { label: 'Hierarchy Levels', value: deleteImpact.dependencies.hierarchyLevels, icon: 'solar:hierarchy-bold', color: '#F57C00' },
                      { label: 'Approvals', value: deleteImpact.dependencies.approvals, icon: 'solar:clipboard-check-bold', color: '#00BCD4' },
                    ].map((dep) => (
                      <Box
                        key={dep.label}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          p: 1.5,
                          borderRadius: 1,
                          bgcolor: 'action.hover',
                        }}
                      >
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: `${dep.color}14`,
                          }}
                        >
                          <Iconify icon={dep.icon} width={16} sx={{ color: dep.color }} />
                        </Box>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{dep.value}</Typography>
                          <Typography variant="caption" color="text.secondary">{dep.label}</Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>

                  {deleteImpact.hasDependencies && (
                    <>
                      <Alert severity="info" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                          This department has active dependencies. You can merge into another department in the same zone ({deleteImpact.zoneName}) or delete directly if dependencies are acceptable.
                        </Typography>
                      </Alert>

                      {!showMergeDialog ? (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={handleOpenMerge}
                            startIcon={<Iconify icon="solar:merge-bold" />}
                          >
                            Merge into another Department
                          </Button>
                        </Box>
                      ) : (
                        <Box sx={{ mt: 1 }}>
                          <Alert severity="warning" sx={{ mb: 2 }}>
                            <Typography variant="body2">
                              Users, Roles, Hierarchy Levels, and Approvals will be migrated to the destination.
                            </Typography>
                          </Alert>
                          <TextField
                            select
                            fullWidth
                            size="small"
                            label="Destination Department"
                            value={mergeTargetId}
                            onChange={(e) => setMergeTargetId(Number(e.target.value))}
                            sx={{ mb: 2 }}
                          >
                            {mergeCandidates.map((d: any) => (
                              <MenuItem key={d.id} value={d.id}>
                                {d.name} — <ZoneBadge name={d.zoneName} />
                              </MenuItem>
                            ))}
                          </TextField>
                          {mergeError && <Alert severity="error" sx={{ mb: 1 }}>{mergeError}</Alert>}
                          <Stack direction="row" spacing={1}>
                            <Button
                              variant="contained"
                              color="warning"
                              onClick={handleMerge}
                              disabled={!mergeTargetId || isMerging}
                            >
                              {isMerging ? 'Merging...' : 'Confirm Merge'}
                            </Button>
                            <Button color="inherit" onClick={() => setShowMergeDialog(false)}>Back</Button>
                          </Stack>
                        </Box>
                      )}
                    </>
                  )}
                </>
              )}

              {deleteError && !isCheckingImpact && (
                <Alert severity="error" sx={{ mt: 1 }}>{deleteError}</Alert>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete} color="inherit">Cancel</Button>
          {deleteImpact && !deleteImpact.hasDependencies && (
            <Button onClick={handleDirectDelete} color="error" variant="contained" disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Department'}
            </Button>
          )}
          {deleteImpact && deleteImpact.hasDependencies && !showMergeDialog && (
            <Button onClick={handleDirectDelete} color="error" variant="outlined" disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Anyway'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
