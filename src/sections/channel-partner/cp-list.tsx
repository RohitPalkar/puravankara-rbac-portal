import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

import dayjs from 'dayjs';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { queryKeys } from 'src/services/api/query-keys';
import { useDeleteChannelPartner } from 'src/services/hooks/use-channel-partners';
import { channelPartnerService } from 'src/services/services/channel-partner.service';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { DataTable } from 'src/components/data-table';
import { EmptyState } from 'src/components/empty-state';
import { RowActionsMenu } from 'src/components/row-actions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { PageHeader, PageContainer } from 'src/components/page-layout';

const PAGE_SIZE = 20;

export default function ChannelPartnerListPage() {
  const navigate = useNavigate();
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: PAGE_SIZE });
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { mutateAsync: deleteChannelPartner, isPending: isDeleting } = useDeleteChannelPartner();

  const handleDelete = useCallback(async () => {
    if (deleteId === null) return;
    try {
      await deleteChannelPartner(deleteId);
      setDeleteId(null);
    } catch {
      // handled by query cache invalidation
    }
  }, [deleteId, deleteChannelPartner]);

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
    queryKey: [...queryKeys.channelPartners.list(queryParams as Record<string, unknown>)],
    queryFn: async () => {
      const res = await channelPartnerService.list(queryParams as any);
      return { data: res.data, meta: res.meta };
    },
  });

  const channelPartners = response?.data ?? [];
  const meta = response?.meta;

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, []);

  const columns: GridColDef[] = [
    { field: 'cpId', headerName: 'CP ID', width: 120 },
    { field: 'cpName', headerName: 'CP Name', flex: 1, minWidth: 180 },
    { field: 'cpTypeName', headerName: 'CP Type', width: 140 },
    {
      field: 'startDate', headerName: 'Start Date', width: 120,
      valueFormatter: (value) => dayjs(value).format('DD MMM YYYY'),
    },
    {
      field: 'endDate', headerName: 'End Date', width: 120,
      valueFormatter: (value) => value ? dayjs(value).format('DD MMM YYYY') : '—',
    },
    {
      field: 'isActive', headerName: 'Status', width: 100,
      renderCell: (params) => (
        <Label color={params.value ? 'success' : 'default'}>{params.value ? 'Active' : 'Inactive'}</Label>
      ),
    },
    {
      field: 'actions', headerName: '', width: 64, sortable: false, disableColumnMenu: true, align: 'center',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 1 }}>
          <RowActionsMenu actions={[
            { label: 'Edit', icon: 'solar:pen-bold' as const, onClick: () => navigate(paths.dashboard.channelPartnerMasterEdit(params.row.id)) },
            { label: 'Delete', icon: 'solar:trash-bin-trash-bold' as const, onClick: () => setDeleteId(params.row.id), color: 'error.main' as const },
          ]} />
        </Box>
      ),
    },
  ];

  return (
    <>
      <Helmet><title>Channel Partners - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader title="Channel Partners" description="Manage registered channel partners" action={
          <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={() => navigate(paths.dashboard.channelPartnerMasterCreate)}>
            Create Channel Partner
          </Button>
        } />
        <Card sx={{ overflow: 'hidden' }}>
          {isError ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Alert severity="error">Failed to load channel partners: {(error as Error)?.message || 'Unknown error'}</Alert>
            </Box>
          ) : !isLoading && channelPartners.length === 0 && !search ? (
            <EmptyState
              icon="solar:handshake-bold-duotone"
              title="No Channel Partners Created"
              description="Create your first channel partner to get started"
            />
          ) : (
            <DataTable
              columns={columns}
              rows={channelPartners}
              getRowId={(r) => r.id}
              loading={isLoading}
              paginationMode="server"
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              rowCount={meta?.total ?? 0}
              onSearchChange={handleSearchChange}
              searchValue={search}
              searchPlaceholder="Search by CP name..."
              dataGridSx={{
                '& .MuiDataGrid-row': { cursor: 'default' as any },
              }}
            />
          )}
        </Card>
      </PageContainer>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Channel Partner"
        message="Are you sure you want to delete this channel partner? This action cannot be undone."
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}
