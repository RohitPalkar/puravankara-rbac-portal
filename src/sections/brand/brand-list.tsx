import type { GridColDef, GridPaginationModel, GridColumnHeaderParams } from '@mui/x-data-grid';

import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { queryKeys } from 'src/services/api/query-keys';
import { brandService } from 'src/services/services/brand.service';
import { useMyPermissions } from 'src/services/hooks/use-permissions';

import { DataTable } from 'src/components/data-table';
import { EmptyState } from 'src/components/empty-state';
import { Iconify } from 'src/components/iconify';
import { PageHeader, PageContainer } from 'src/components/page-layout';

const PAGE_SIZE = 20;

const groupMap: Record<string, string> = {
  reraRegularizationPercentage: 'RERA',
  reraQualificationPercentage: 'RERA',
  rtmRegularizationPercentage: 'RTM',
  rtmQualificationPercentage: 'RTM',
};

const groupDividerFields = ['salaryMultiplier', 'reraQualificationPercentage', 'rtmQualificationPercentage'];

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

function renderBrandHeader(params: GridColumnHeaderParams) {
  const group = groupMap[params.field];
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: 1,
        height: 1,
        gap: 1,
      }}
    >
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: '0.75rem',
          lineHeight: 1.1,
          color: 'text.secondary',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        {group ?? ''}
      </Typography>
      <Typography
        sx={{
          fontWeight: 600,
          fontSize: '0.8125rem',
          lineHeight: 1.2,
          color: 'text.secondary',
          whiteSpace: 'nowrap',
          overflow: 'visible',
        }}
      >
        {params.colDef.headerName}
      </Typography>
    </Box>
  );
}

export default function BrandListPage() {
  const navigate = useNavigate();
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: PAGE_SIZE });
  const [search, setSearch] = useState('');

  const { data: permissions } = useMyPermissions();

  const canCreate = useMemo(() => hasBrandPermission(permissions, 'CREATE'), [permissions]);
  const canEdit = useMemo(() => hasBrandPermission(permissions, 'EDIT'), [permissions]);

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
    queryKey: [...queryKeys.brands.list(queryParams as Record<string, unknown>)],
    queryFn: async () => {
      const res = await brandService.list(queryParams as any);
      return { data: res.data, meta: res.meta };
    },
  });

  const brands = response?.data ?? [];
  const meta = response?.meta;

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, []);

  const dividerSx = groupDividerFields.reduce((acc, field) => {
    acc[`& .MuiDataGrid-columnHeader[data-field="${field}"], & .MuiDataGrid-cell[data-field="${field}"]`] = {
      borderRight: '2px solid',
      borderColor: 'divider',
    };
    return acc;
  }, {} as Record<string, any>);

  const columns: GridColDef[] = [
    { field: 'brandName', headerName: 'Brand Name', flex: 4, minWidth: 220, renderHeader: renderBrandHeader },
    {
      field: 'salaryMultiplier',
      headerName: 'Salary Multiplier',
      flex: 2,
      minWidth: 160,
      renderHeader: renderBrandHeader,
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (value: number) => `${value}x`,
    },
    {
      field: 'reraRegularizationPercentage',
      headerName: 'Regularisation %',
      minWidth: 144,
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      renderHeader: renderBrandHeader,
      valueFormatter: (value: number | null) => (value != null ? `${value}%` : '—'),
    },
    {
      field: 'reraQualificationPercentage',
      headerName: 'Qualification',
      minWidth: 144,
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      renderHeader: renderBrandHeader,
      valueFormatter: (value: number | null) => (value != null ? `${value}%` : '—'),
    },
    {
      field: 'rtmRegularizationPercentage',
      headerName: 'Regularisation %',
      minWidth: 144,
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      renderHeader: renderBrandHeader,
      valueFormatter: (value: number | null) => (value != null ? `${value}%` : '—'),
    },
    {
      field: 'rtmQualificationPercentage',
      headerName: 'Qualification',
      minWidth: 144,
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      renderHeader: renderBrandHeader,
      valueFormatter: (value: number | null) => (value != null ? `${value}%` : '—'),
    },
    ...(canEdit ? [{
      field: 'actions' as const,
      headerName: '',
      width: 64,
      sortable: false,
      disableColumnMenu: true,
      align: 'center' as const,
      renderHeader: renderBrandHeader,
      renderCell: (params: any) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 1 }}>
          <IconButton onClick={() => navigate(paths.dashboard.brandMasterEdit(params.row.id))}>
            <Iconify icon="solar:pen-bold" width={18} />
          </IconButton>
        </Box>
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
              searchPlaceholder="Search by brand name"
              hideColumnsButton
              columnHeaderHeight={76}
              dataGridSx={{
                '& .MuiDataGrid-columnHeaders': {
                  borderBottom: '2px solid',
                  borderColor: 'divider',
                  bgcolor: 'grey.100',
                },
                '& .MuiDataGrid-columnHeader': {
                  px: 1.5,
                  py: 2.5,
                },
                '& .MuiDataGrid-cell': {
                  px: 1.5,
                  py: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '0.875rem',
                  '&:focus': { outline: 'none' },
                  '&:focus-within': { outline: 'none' },
                },
                '& .MuiDataGrid-row': {
                  minHeight: '72px !important',
                  cursor: 'default' as any,
                  '&:hover': { bgcolor: 'action.hover' },
                  '&.Mui-selected': { bgcolor: 'primary.lighter' },
                },
                ...dividerSx,
              }}
            />
          )}
        </Card>
      </PageContainer>
    </>
  );
}
