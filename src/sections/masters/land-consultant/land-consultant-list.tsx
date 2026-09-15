import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useMemo, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { queryKeys } from 'src/services/api/query-keys';
import { userService } from 'src/services/services/user.service';
import {
  useLandConsultantList,
  useDeleteLandConsultant,
} from 'src/services/hooks/use-land-consultants';

import { Iconify } from 'src/components/iconify';
import { DataTable } from 'src/components/data-table';
import { RowActionsMenu } from 'src/components/row-actions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { PageHeader, PageContainer } from 'src/components/page-layout';

const PAGE_SIZE = 5;

export default function LandConsultantListPage() {
  const navigate = useNavigate();
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: PAGE_SIZE,
  });
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const queryParams = useMemo(
    () => ({
      page: paginationModel.page + 1,
      limit: paginationModel.pageSize,
      ...(search ? { search } : {}),
      sortBy: 'createdAt',
      sortOrder: 'DESC' as const,
    }),
    [paginationModel, search]
  );

  const { data: response, isLoading, isError, refetch } = useLandConsultantList(queryParams as any) as any;
  const { mutateAsync: deleteConsultant, isPending: isDeleting } = useDeleteLandConsultant();

  // BD Executive name map
  const { data: usersData } = useQuery({
    queryKey: queryKeys.users.list({ page: 1, limit: 100 } as any),
    queryFn: async () => {
      const res = await userService.list({ page: 1, limit: 100 } as any);
      return res.data as any;
    },
  });
  const users = (usersData as any)?.data ?? (Array.isArray(usersData) ? usersData : []);
  const bdName = useCallback(
    (id: string) => {
      const u = (users as any[]).find((x: any) => x.empId === id || x.id === id);
      return u?.name ?? id ?? '-';
    },
    [users]
  );

  const consultants = response?.data ?? [];
  const meta = response?.meta;

  const handleDelete = useCallback(async () => {
    if (deleteId === null) return;
    try {
      await deleteConsultant(deleteId);
      setDeleteId(null);
    } catch {
      // handled
    }
  }, [deleteId, deleteConsultant]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, []);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'consultantDisplayName',
        headerName: 'Consultant Name',
        flex: 1.5,
        minWidth: 180,
        valueGetter: (_value, row: any) =>
          row.consultantType === 'Registered'
            ? row.businessName || row.consultantName || '-'
            : row.consultantName || row.businessName || '-',
        renderCell: (params) => (
          <Typography variant="body2" fontWeight={500} noWrap>
            {params.value}
          </Typography>
        ),
      },
      {
        field: 'consultantType',
        headerName: 'Type',
        width: 120,
        renderCell: (params) => {
          const isRegistered = params.value === 'Registered';
          return (
            <Chip
              label={params.value}
              size="small"
              sx={{
                height: 24,
                fontSize: '0.75rem',
                fontWeight: 500,
                bgcolor: isRegistered ? '#E6F7F8' : '#F3E8FF',
                color: isRegistered ? '#0E7C8E' : '#7C3AED',
                borderRadius: '6px',
              }}
            />
          );
        },
      },
      {
        field: 'contactPersonDetails',
        headerName: 'Contact Person Details',
        flex: 1.8,
        minWidth: 220,
        sortable: false,
        renderCell: (params) => {
          const row = params.row as any;
          return (
            <Stack spacing={0} sx={{ py: 0.5 }}>
              <Typography variant="body2" fontWeight={500} lineHeight={1.2} noWrap>
                {row.contactPersonName || '-'}
              </Typography>
              <Typography variant="caption" color="text.secondary" lineHeight={1.2} noWrap>
                {row.emailAddress || ''}
              </Typography>
            </Stack>
          );
        },
      },
      {
        field: 'bdExecutiveId',
        headerName: 'BD Executive',
        width: 130,
        renderCell: (params) => (
          <Typography variant="body2" noWrap>
            {bdName(params.value)}
          </Typography>
        ),
      },
      {
        field: 'proposedS0Count',
        headerName: 'Proposed (S0)',
        width: 120,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Typography variant="body2" fontWeight={500} sx={{ width: 1, textAlign: 'center' }}>
            {params.value ?? 0}
          </Typography>
        ),
      },
      {
        field: 's1s2Count',
        headerName: 'S1/S2',
        width: 80,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Typography variant="body2" fontWeight={500} sx={{ width: 1, textAlign: 'center' }}>
            {params.value ?? 0}
          </Typography>
        ),
      },
      {
        field: 'mouJdaCount',
        headerName: 'MOU/JDA/Termsheet',
        width: 160,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Typography variant="body2" fontWeight={500} sx={{ width: 1, textAlign: 'center' }}>
            {params.value ?? 0}
          </Typography>
        ),
      },
      {
        field: 'actions',
        headerName: '',
        width: 50,
        sortable: false,
        align: 'center',
        renderCell: (params) => (
          <Box sx={{ display: 'flex', justifyContent: 'center', width: 1 }}>
            <RowActionsMenu
              actions={[
                {
                  label: 'View',
                  icon: 'solar:eye-bold',
                  onClick: () => navigate(paths.dashboard.masters.consultantEdit(params.row.id)),
                },
                {
                  label: 'Edit',
                  icon: 'solar:pen-bold',
                  onClick: () => navigate(paths.dashboard.masters.consultantEdit(params.row.id)),
                },
                {
                  label: 'Delete',
                  icon: 'solar:trash-bin-trash-bold',
                  onClick: () => setDeleteId(params.row.id),
                  color: 'error.main',
                },
              ]}
            />
          </Box>
        ),
      },
    ],
    [navigate, bdName]
  );

  return (
    <>
      <Helmet>
        <title>Land Consultant - {CONFIG.appName}</title>
      </Helmet>
      <PageContainer>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" fontWeight={700}>
            Land Consultant
          </Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => navigate(paths.dashboard.masters.consultantCreate)}
            sx={{
              bgcolor: '#1A237E',
              '&:hover': { bgcolor: '#283593' },
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Create Land Consultant
          </Button>
        </Box>

        <DataTable
          columns={columns}
          rows={consultants}
          getRowId={(r) => r.id}
          loading={isLoading}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          rowCount={meta?.total ?? 0}
          onSearchChange={handleSearchChange}
          searchValue={search}
          searchPlaceholder="Search by name"
          error={isError}
          onErrorRetry={() => refetch()}
          errorMessage="Failed to load land consultants"
          emptyTitle="No Land Consultants"
          emptyDescription="Create your first land consultant"
          emptyIcon="solar:users-group-rounded-bold-duotone"
          createAction={{
            icon: 'mingcute:add-line',
            label: 'Create Land Consultant',
            onClick: () => navigate(paths.dashboard.masters.consultantCreate),
          }}
          dataGridSx={{
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: '#F8F9FC',
              borderBottom: '1px solid #E8EAF0',
            },
            '& .MuiDataGrid-row': {
              borderBottom: '1px dashed #E8EAF0',
            },
          }}
        />
      </PageContainer>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Land Consultant"
        message="Are you sure you want to delete this land consultant? This action cannot be undone."
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}
