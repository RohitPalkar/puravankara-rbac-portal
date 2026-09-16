import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useMemo, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { queryKeys } from 'src/services/api/query-keys';
import { zoneService } from 'src/services/services/geography.service';
import { useLaCityList, useDeleteLaCity } from 'src/services/hooks/use-la-cities';

import { Iconify } from 'src/components/iconify';
import { DataTable } from 'src/components/data-table';
import { RowActionsMenu } from 'src/components/row-actions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { PageContainer } from 'src/components/page-layout';

const PAGE_SIZE = 5;

export default function LaCityListPage() {
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

  const { data: response, isLoading, isError, refetch } = useLaCityList(queryParams as any) as any;
  const { mutateAsync: deleteCity, isPending: isDeleting } = useDeleteLaCity();

  const { data: zonesResponse } = useQuery({
    queryKey: queryKeys.zones.list({}),
    queryFn: async () => {
      const res = await zoneService.list({} as any);
      return res.data as any;
    },
  });
  const zones: any[] = useMemo(() => {
    const raw: any = zonesResponse;
    return raw?.data ?? (Array.isArray(raw) ? raw : []);
  }, [zonesResponse]);
  const zoneName = useCallback(
    (id: number) => zones.find((z) => z.id === id)?.name ?? '-',
    [zones]
  );

  const cities: any[] = response?.data ?? [];
  const meta = response?.meta;

  const handleDelete = useCallback(async () => {
    if (deleteId === null) return;
    try {
      await deleteCity(deleteId);
      setDeleteId(null);
    } catch {
      // handled by error UI
    }
  }, [deleteId, deleteCity]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, []);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'cityName',
        headerName: 'City Name',
        flex: 1,
        minWidth: 140,
        renderCell: (params) => (
          <Typography variant="body2" fontWeight={600} noWrap>
            {params.value}
          </Typography>
        ),
      },
      {
        field: 'businessZoneId',
        headerName: 'Business Zone',
        width: 130,
        renderCell: (params) => (
          <Chip
            label={zoneName(params.value) !== '-' ? zoneName(params.value) : params.row.businessZoneName || '-'}
            size="small"
            variant="outlined"
            sx={{ borderRadius: '6px', fontSize: '0.75rem' }}
          />
        ),
      },
      {
        field: 'regionsCount',
        headerName: 'Regions',
        width: 90,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Typography variant="body2" sx={{ width: 1, textAlign: 'center' }}>
            {params.value ?? 0}
          </Typography>
        ),
      },
      {
        field: 'micromarketsCount',
        headerName: 'Micromarkets',
        width: 120,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Typography variant="body2" sx={{ width: 1, textAlign: 'center' }}>
            {params.value ?? 0}
          </Typography>
        ),
      },
      {
        field: 'pincodesCount',
        headerName: 'Pincodes/Localities',
        width: 160,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Typography variant="body2" sx={{ width: 1, textAlign: 'center' }}>
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
                  onClick: () => navigate(`/dashboard/la-cities/${params.row.id}`),
                },
                {
                  label: 'Edit',
                  icon: 'solar:pen-bold',
                  onClick: () => navigate(`/dashboard/la-cities/${params.row.id}/edit`),
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
    [navigate, zoneName]
  );

  return (
    <>
      <Helmet>
        <title>City - {CONFIG.appName}</title>
      </Helmet>
      <PageContainer>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" fontWeight={700}>
            City
          </Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => navigate('/dashboard/la-cities/new')}
            sx={{
              bgcolor: '#1A237E',
              '&:hover': { bgcolor: '#283593' },
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Add City
          </Button>
        </Box>

        <DataTable
          columns={columns}
          rows={cities}
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
          errorMessage="Failed to load cities"
          emptyTitle="No Cities"
          emptyDescription="Add your first city for Land Acquisition"
          emptyIcon="solar:city-bold-duotone"
          createAction={{
            icon: 'mingcute:add-line',
            label: 'Add City',
            onClick: () => navigate('/dashboard/la-cities/new'),
          }}
        />
      </PageContainer>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete City"
        message="Are you sure you want to delete this city? This action cannot be undone."
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}
