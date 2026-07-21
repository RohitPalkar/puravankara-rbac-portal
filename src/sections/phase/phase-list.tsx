import type { Phase } from 'src/services/types/phase';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

import dayjs from 'dayjs';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import RadioGroup from '@mui/material/RadioGroup';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { queryKeys } from 'src/services/api/query-keys';
import { phaseService } from 'src/services/services/phase.service';
import { useMyPermissions } from 'src/services/hooks/use-permissions';
import { useDeletePhase, useUpdateLaunch } from 'src/services/hooks/use-phases';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { DataTable } from 'src/components/data-table';
import { EmptyState } from 'src/components/empty-state';
import { RowActionsMenu } from 'src/components/row-actions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { PageHeader, PageContainer } from 'src/components/page-layout';

const PAGE_SIZE = 20;

function hasPhasePermission(
  permissions: { projects: { modules: { subModules: { name: string; actions: { code: string; allowed: boolean }[] }[] }[] }[] } | undefined,
  action: string
): boolean {
  if (!permissions) return false;
  return permissions.projects.some((project) =>
    project.modules.some((mod) =>
      mod.subModules.some((sub) =>
        sub.name === 'PHASES' && sub.actions.some((a) => a.code === action && a.allowed)
      )
    )
  );
}

type LaunchDialogMode = 'edit' | 'skip';

export default function PhaseListPage() {
  const navigate = useNavigate();
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: PAGE_SIZE });
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [launchPhase, setLaunchPhase] = useState<Phase | null>(null);
  const [launchMode, setLaunchMode] = useState<LaunchDialogMode>('edit');
  const [launchStartDate, setLaunchStartDate] = useState('');
  const [launchEndDate, setLaunchEndDate] = useState('');

  const { data: permissions } = useMyPermissions();

  const canCreate = useMemo(() => hasPhasePermission(permissions, 'CREATE'), [permissions]);
  const canEdit = useMemo(() => hasPhasePermission(permissions, 'EDIT'), [permissions]);
  const canLaunch = useMemo(() => hasPhasePermission(permissions, 'LAUNCH'), [permissions]);

  const { mutateAsync: deletePhase, isPending: isDeleting } = useDeletePhase();
  const { mutateAsync: updateLaunch, isPending: isLaunching } = useUpdateLaunch();

  const handleDelete = useCallback(async () => {
    if (deleteId === null) return;
    try {
      await deletePhase(deleteId);
      setDeleteId(null);
    } catch {
      // handled by query cache invalidation
    }
  }, [deleteId, deletePhase]);

  const handleOpenLaunch = useCallback((phase: Phase) => {
    setLaunchPhase(phase);
    setLaunchMode(phase.launchEnabled ? 'edit' : 'edit');
    setLaunchStartDate(phase.launchStartDate ?? '');
    setLaunchEndDate(phase.launchEndDate ?? '');
  }, []);

  const handleCloseLaunch = useCallback(() => {
    setLaunchPhase(null);
    setLaunchMode('edit');
    setLaunchStartDate('');
    setLaunchEndDate('');
  }, []);

  const handleApplyLaunch = useCallback(async () => {
    if (!launchPhase) return;
    try {
      await updateLaunch({
        id: launchPhase.id,
        data: {
          launchEnabled: launchMode === 'edit',
          launchStartDate: launchMode === 'edit' ? launchStartDate || undefined : undefined,
          launchEndDate: launchMode === 'edit' ? launchEndDate || undefined : undefined,
        },
      });
      handleCloseLaunch();
    } catch {
      // handled by react-query
    }
  }, [launchPhase, launchMode, launchStartDate, launchEndDate, updateLaunch, handleCloseLaunch]);

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
    queryKey: [...queryKeys.phases.list(queryParams as Record<string, unknown>)],
    queryFn: async () => {
      const res = await phaseService.list(queryParams as any);
      return { data: res.data, meta: res.meta };
    },
  });

  const phases = response?.data ?? [];
  const meta = response?.meta;

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, []);

  const columns: GridColDef[] = [
    { field: 'phaseName', headerName: 'Phase Name', flex: 1, minWidth: 160 },
    { field: 'projectName', headerName: 'Project', flex: 1, minWidth: 140 },
    {
      field: 'launchEnabled', headerName: 'Launch', width: 90, align: 'center', headerAlign: 'center',
      renderCell: (params) => (
        <Label color={params.value ? 'success' : 'default'}>{params.value ? 'Y' : 'N'}</Label>
      ),
    },
    {
      field: 'sustenanceEnabled', headerName: 'Sustenance', width: 110, align: 'center', headerAlign: 'center',
      renderCell: (params) => (
        <Label color={params.value ? 'info' : 'default'}>{params.value ? 'Y' : 'N'}</Label>
      ),
    },
    {
      field: 'launchStartDate', headerName: 'Launch Dates', width: 180,
      renderCell: (params) => {
        const start = params.value ? dayjs(params.value).format('DD MMM YYYY') : '';
        const end = params.row.launchEndDate ? dayjs(params.row.launchEndDate).format('DD MMM YYYY') : '';
        if (!start && !end) return <span style={{ color: '#999' }}>—</span>;
        return `${start} - ${end}`;
      },
    },
    {
      field: 'sustenanceDate', headerName: 'Sustenance', width: 120,
      valueFormatter: (value: string | null) => (value ? dayjs(value).format('DD MMM YYYY') : '—'),
    },
    {
      field: 'possessionDate', headerName: 'Possession', width: 120,
      valueFormatter: (value: string) => dayjs(value).format('DD MMM YYYY'),
    },
    { field: 'brandName', headerName: 'Brand', width: 110 },
    { field: 'cityName', headerName: 'City', width: 110 },
    {
      field: 'actions', headerName: '', width: 64, sortable: false, disableColumnMenu: true, align: 'center',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 1 }}>
          <RowActionsMenu actions={[
            ...(canEdit ? [{ label: 'Edit', icon: 'solar:pen-bold' as const, onClick: () => navigate(paths.dashboard.phaseMasterEdit(params.row.id)) }] : []),
            ...(canLaunch ? [{ label: 'Launch Phase', icon: 'solar:rocket-bold' as const, onClick: () => handleOpenLaunch(params.row as Phase) }] : []),
            { label: 'Delete', icon: 'solar:trash-bin-trash-bold' as const, onClick: () => setDeleteId(params.row.id), color: 'error.main' as const },
          ]} />
        </Box>
      ),
    },
  ];

  return (
    <>
      <Helmet><title>Phases - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader title="Phase" description="Manage project phases and launch configurations" action={
          canCreate ? (
            <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={() => navigate(paths.dashboard.phaseMasterCreate)}>
              Create Phase
            </Button>
          ) : null
        } />
        <Card sx={{ overflow: 'hidden' }}>
          {isError ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Alert severity="error">Failed to load phases: {(error as Error)?.message || 'Unknown error'}</Alert>
            </Box>
          ) : !isLoading && phases.length === 0 && !search ? (
            <EmptyState
              icon="solar:calendar-bold-duotone"
              title="No Phases Created"
              description="Create your first phase to get started"
            />
          ) : (
            <DataTable
              columns={columns}
              rows={phases}
              getRowId={(r) => r.id}
              loading={isLoading}
              paginationMode="server"
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              rowCount={meta?.total ?? 0}
              onSearchChange={handleSearchChange}
              searchValue={search}
              searchPlaceholder="Search by Phase Name"
              hideColumnsButton
              columnHeaderHeight={56}
              dataGridSx={{
                '& .MuiDataGrid-columnHeaders': { borderBottom: '2px solid', borderColor: 'divider', bgcolor: 'grey.100' },
                '& .MuiDataGrid-columnHeader': { px: 1.5, py: 2.5 },
                '& .MuiDataGrid-cell': { px: 1.5, py: '24px', display: 'flex', alignItems: 'center', fontSize: '0.875rem', '&:focus': { outline: 'none' }, '&:focus-within': { outline: 'none' } },
                '& .MuiDataGrid-row': { minHeight: '72px !important', cursor: 'default' as any, '&:hover': { bgcolor: 'action.hover' }, '&.Mui-selected': { bgcolor: 'primary.lighter' } },
              }}
            />
          )}
        </Card>
      </PageContainer>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Phase"
        message="Are you sure you want to delete this phase? This action cannot be undone."
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      <Dialog open={!!launchPhase} onClose={handleCloseLaunch} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Launch Phase</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <RadioGroup value={launchMode} onChange={(e) => setLaunchMode(e.target.value as LaunchDialogMode)}>
              <FormControlLabel value="edit" control={<Radio />} label="Edit Launch Period" />
              {launchMode === 'edit' && (
                <Stack spacing={2.5} sx={{ ml: 3.5, mt: 1.5 }}>
                  <TextField
                    label="Launch Start Date"
                    type="date"
                    value={launchStartDate}
                    onChange={(e) => setLaunchStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                  <TextField
                    label="Launch End Date"
                    type="date"
                    value={launchEndDate}
                    onChange={(e) => setLaunchEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Stack>
              )}
              <FormControlLabel value="skip" control={<Radio />} label="Skip Launch Phase" />
            </RadioGroup>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLaunch} color="inherit">Cancel</Button>
          <Button onClick={handleApplyLaunch} variant="contained" disabled={isLaunching}>
            {isLaunching ? 'Applying...' : 'Apply'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
