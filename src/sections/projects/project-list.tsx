import type { Project } from 'src/services/types/project';
import type { GridColDef, GridPaginationModel, GridColumnHeaderParams } from '@mui/x-data-grid';

import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { queryKeys } from 'src/services/api/query-keys';
import { projectService } from 'src/services/services/project.service';

import { Iconify } from 'src/components/iconify';
import { DataTable } from 'src/components/data-table';
import { RowActionsMenu } from 'src/components/row-actions';
import { PageHeader, PageContainer } from 'src/components/page-layout';
import { PermissionChips } from 'src/components/permission-summary/permission-summary';

const PAGE_SIZE = 20;

const groupMap: Record<string, string> = {
  reraRegularizationPercentage: 'RERA',
  reraQualificationPercentage: 'RERA',
  rtmRegularizationPercentage: 'RTM',
  rtmQualificationPercentage: 'RTM',
};

const groupDividerFields = ['reraQualificationPercentage', 'rtmQualificationPercentage'];

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

function getIncentiveValue(rule: Project['incentiveRules'], type: string, field: string): number | null {
  const match = rule?.find((r) => r.incentiveType === type);
  if (!match) return null;
  const val = match[field as keyof typeof match];
  return typeof val === 'number' ? val : null;
}

export default function ProjectListPage() {
  const navigate = useNavigate();
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: PAGE_SIZE });
  const [search, setSearch] = useState('');

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
    queryKey: [...queryKeys.projects.list(queryParams as Record<string, unknown>)],
    queryFn: async () => {
      const res = await projectService.list(queryParams as any);
      return { data: res.data, meta: res.meta };
    },
  });

  const projects = response?.data ?? [];
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
    { field: 'name', headerName: 'Project Name', flex: 4, minWidth: 220, renderHeader: renderBrandHeader },
    { field: 'cityName', headerName: 'City', flex: 2, minWidth: 130, renderHeader: renderBrandHeader },
    { field: 'brandName', headerName: 'Brand', flex: 2, minWidth: 130, renderHeader: renderBrandHeader },
    {
      field: 'reraRegularizationPercentage',
      headerName: 'Regularisation %',
      minWidth: 144,
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      renderHeader: renderBrandHeader,
      valueGetter: (_value: any, row: Project) => getIncentiveValue(row.incentiveRules, 'RERA', 'regularizationPercentage'),
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
      valueGetter: (_value: any, row: Project) => getIncentiveValue(row.incentiveRules, 'RERA', 'payablePercentage'),
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
      valueGetter: (_value: any, row: Project) => getIncentiveValue(row.incentiveRules, 'RTM', 'regularizationPercentage'),
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
      valueGetter: (_value: any, row: Project) => getIncentiveValue(row.incentiveRules, 'RTM', 'payablePercentage'),
      valueFormatter: (value: number | null) => (value != null ? `${value}%` : '—'),
    },
    {
      field: 'actions' as const, headerName: '', width: 64, sortable: false, disableColumnMenu: true,
      align: 'center' as const,
      renderHeader: renderBrandHeader,
      renderCell: (params: any) => (
        <Stack alignItems="center" sx={{ height: 1, justifyContent: 'center' }}>
          <RowActionsMenu actions={[
            { label: 'Edit', icon: 'solar:pen-bold', onClick: () => navigate(paths.dashboard.projectMasterEdit(params.row.id)) },
          ]} />
        </Stack>
      ),
    },
  ];

  return (
    <>
      <Helmet><title>Projects - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader title="Projects" description="Manage project master data" action={
          <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={() => navigate(paths.dashboard.projectMasterCreate)}>
            Create Project
          </Button>
        } />
        <Box sx={{ mb: 1.5 }}>
          <PermissionChips moduleName="PROJECTS" />
        </Box>
        <DataTable
          columns={columns}
          rows={projects}
          getRowId={(r) => r.id}
          loading={isLoading}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          rowCount={meta?.total ?? 0}
          onSearchChange={handleSearchChange}
          searchValue={search}
          searchPlaceholder="Search by Project name"
          hideColumnsButton
          columnHeaderHeight={76}
          error={isError}
          errorMessage={`Failed to load projects: ${(error as Error)?.message || 'Unknown error'}`}
          emptyTitle="No Projects Created"
          emptyDescription="Create your first project to define phases, incentives, and locations"
          emptyIcon="solar:building-bold-duotone"
          createAction={{ icon: 'solar:add-circle-bold', label: 'Create Project', onClick: () => navigate(paths.dashboard.projectMasterCreate) }}
          dataGridSx={dividerSx}
        />
      </PageContainer>
    </>
  );
}
