import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { queryKeys } from 'src/services/api/query-keys';
import { userService } from 'src/services/services/user.service';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { DataTable } from 'src/components/data-table';
import { EmptyState } from 'src/components/empty-state';
import { RowActionsMenu } from 'src/components/row-actions';
import { PageHeader, PageContainer } from 'src/components/page-layout';

const PAGE_SIZE = 20;

export default function UserListPage() {
  const navigate = useNavigate();
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: PAGE_SIZE });
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});

  const queryParams = useMemo(() => {
    const params: Record<string, unknown> = {
      page: paginationModel.page + 1,
      limit: paginationModel.pageSize,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    };
    if (search) params.search = search;
    if (filters.status) params.isActive = filters.status === 'active';
    return params;
  }, [search, paginationModel, filters]);

  const { data: response, isLoading, isError, error } = useQuery({
    queryKey: [...queryKeys.users.list(queryParams as Record<string, unknown>)],
    queryFn: async () => {
      const res = await userService.list(queryParams as any);
      return { data: res.data, meta: res.meta };
    },
  });

  const users = response?.data ?? [];
  const meta = response?.meta;

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, []);

  const handleFiltersChange = useCallback((newFilters: Record<string, string>) => {
    setFilters(newFilters);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, []);

  const handleStatusToggle = useCallback(async (user: any) => {
    // Toggle active/inactive via update API
    try {
      await userService.update(user.empId, { isActive: !user.isActive });
      // query invalidation handled by the service layer
    } catch {
      // handled by react-query
    }
  }, []);

  const filterOptions = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ],
    },
  ];

  const columns: GridColDef[] = [
    { field: 'empId', headerName: 'Employee ID', width: 110 },
    {
      field: 'name', headerName: 'Name', flex: 1, minWidth: 160,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600} noWrap>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'email', headerName: 'Email', flex: 1, minWidth: 200,
      renderCell: (params) => (
        <Tooltip title={params.value} arrow>
          <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 1 }}>
            {params.value}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: 'departmentName', headerName: 'Department', width: 140,
      renderCell: (params) => (
        <Typography variant="body2" noWrap>
          {params.value || '-'}
        </Typography>
      ),
    },
    {
      field: 'roleName', headerName: 'Role', width: 150,
      renderCell: (params) => (
        <Typography variant="body2" noWrap>
          {params.value || '-'}
        </Typography>
      ),
    },
    {
      field: 'zoneNames', headerName: 'Zone', minWidth: 180, flex: 1,
      renderCell: (params) => {
        const zones: string[] = params.value ?? [];
        if (zones.length === 0) return <Typography variant="body2" color="text.disabled">-</Typography>;
        const visible = zones.slice(0, 2);
        const remaining = zones.slice(2);
        return (
          <Stack direction="row" spacing={0.5} sx={{ overflow: 'hidden' }}>
            {visible.map((name) => (
              <Chip key={name} label={name} size="small" variant="outlined" sx={{ height: 28, borderRadius: '6px', fontSize: '0.75rem', fontWeight: 500 }} />
            ))}
            {remaining.length > 0 && (
              <Tooltip title={remaining.join(', ')} arrow>
                <Chip label={`+${remaining.length}`} size="small" sx={{ height: 28, borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, color: '#fff', bgcolor: 'primary.main' }} />
              </Tooltip>
            )}
          </Stack>
        );
      },
    },
    {
      field: 'projectCount', headerName: 'Projects', width: 100, align: 'center', headerAlign: 'center',
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={500}>
          {params.value ?? '-'}
        </Typography>
      ),
    },
    {
      field: 'isActive', headerName: 'Status', width: 100,
      renderCell: (params) => (
        <Label color={params.value ? 'success' : 'default'}>
          {params.value ? 'Active' : 'Inactive'}
        </Label>
      ),
    },
    {
      field: 'actions', headerName: '', width: 64, sortable: false, disableColumnMenu: true, align: 'center',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 1 }}>
          <RowActionsMenu actions={[
            { label: 'Edit', icon: 'solar:pen-bold' as const, onClick: () => navigate(paths.dashboard.userEdit(params.row.id)) },
            { label: params.row.isActive ? 'Deactivate' : 'Activate', icon: params.row.isActive ? 'solar:lock-bold' as const : 'solar:unlock-bold' as const, onClick: () => handleStatusToggle(params.row) },
          ]} />
        </Box>
      ),
    },
  ];

  return (
    <>
      <Helmet><title>Users - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader title="Users" description="Manage user accounts and access" action={
          <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={() => navigate(paths.dashboard.userNew)}>
            Create User
          </Button>
        } />
        <Card sx={{ overflow: 'hidden' }}>
          {isError ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Alert severity="error">Failed to load users: {(error as Error)?.message || 'Unknown error'}</Alert>
            </Box>
          ) : !isLoading && users.length === 0 && !search ? (
            <EmptyState
              icon="solar:users-group-rounded-bold-duotone"
              title="No Users Created"
              description="Create your first user to get started"
            />
          ) : (
            <DataTable
              columns={columns}
              rows={users}
              getRowId={(r) => r.empId}
              loading={isLoading}
              paginationMode="server"
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              rowCount={meta?.total ?? 0}
              onSearchChange={handleSearchChange}
              searchValue={search}
              searchPlaceholder="Search by name, employee ID, or email..."
              filterOptions={filterOptions}
              onFiltersChange={handleFiltersChange}
              hideColumnsButton
              columnHeaderHeight={56}
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
              }}
            />
          )}
        </Card>
      </PageContainer>
    </>
  );
}
