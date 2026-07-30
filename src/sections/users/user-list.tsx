import type { Zone } from 'src/services/types/geography';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { queryKeys } from 'src/services/api/query-keys';
import { useUpdateUser } from 'src/services/hooks/use-users';
import { userService } from 'src/services/services/user.service';
import { zoneService } from 'src/services/services/geography.service';
import { useRoleList, useDepartmentList } from 'src/services/hooks/use-organization';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { DataTable } from 'src/components/data-table';
import { RowActionsMenu } from 'src/components/row-actions';
import { PageHeader, PageContainer } from 'src/components/page-layout';

const PAGE_SIZE = 20;

export default function UserListPage() {
  const navigate = useNavigate();
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: PAGE_SIZE });
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});

  const { data: allZones } = useQuery({
    queryKey: queryKeys.zones.list({}),
    queryFn: async () => {
      const res = await zoneService.list({});
      return (res.data ?? []) as Zone[];
    },
  });

  const activeZones = useMemo(() => (allZones ?? []).filter((z: Zone) => z.isActive !== false), [allZones]);

  const { data: departments } = useDepartmentList();
  const activeDepartments = useMemo(() => (departments ?? []).filter((d: any) => d.isActive !== false), [departments]);

  const { data: roles } = useRoleList();
  const activeRoles = useMemo(() => (roles ?? []).filter((r: any) => r.isActive !== false), [roles]);

  const updateUser = useUpdateUser();

  const queryParams = useMemo(() => {
    const params: Record<string, unknown> = {
      page: paginationModel.page + 1,
      limit: paginationModel.pageSize,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    };
    if (search) params.search = search;
    if (filters.status) params.isActive = filters.status === 'active';
    if (filters.reportsTo) params.reportsTo = filters.reportsTo;
    if (filters.zoneId) params.zoneId = Number(filters.zoneId);
    if (filters.departmentId) params.departmentId = Number(filters.departmentId);
    if (filters.roleId) params.roleId = Number(filters.roleId);
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
    try {
      await updateUser.mutateAsync({ id: user.empId, data: { isActive: !user.isActive } });
    } catch {
      // handled by react-query
    }
  }, [updateUser]);

  const filterOptions = [
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ],
    },
    {
      key: 'zoneId',
      label: 'Zone',
      type: 'select' as const,
      options: activeZones.map((z) => ({ value: String(z.id), label: z.name })),
    },
    {
      key: 'reportsTo',
      label: 'Reporting Manager',
      type: 'text' as const,
    },
    {
      key: 'departmentId',
      label: 'Department',
      type: 'select' as const,
      options: activeDepartments?.map((d: any) => ({ value: String(d.id), label: d.name })) ?? [],
    },
    {
      key: 'roleId',
      label: 'Role',
      type: 'select' as const,
      options: activeRoles?.map((r: any) => ({ value: String(r.id), label: r.name })) ?? [],
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
      field: 'isDepartmentAdmin',
      headerName: 'Dept Admin',
      width: 120,
      renderCell: (params) => params.row.isDepartmentAdmin
        ? <Chip label="Yes" color="primary" size="small" variant="outlined" />
        : <Typography variant="body2" color="text.secondary">-</Typography>,
    },
    {
      field: 'reportsToName', headerName: 'Reports To', width: 160,
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
            { label: 'Edit', icon: 'solar:pen-bold' as const, onClick: () => navigate(paths.dashboard.userEdit(params.row.empId)) },
            { label: params.row.isActive ? 'Deactivate' : 'Activate', icon: params.row.isActive ? 'solar:forbidden-circle-bold' as const : 'solar:check-circle-bold' as const, onClick: () => handleStatusToggle(params.row) },
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
          searchPlaceholder="Search Employee, Email..."
          filterOptions={filterOptions}
          onFiltersChange={handleFiltersChange}
          hideColumnsButton
          columnHeaderHeight={56}
          error={isError}
          errorMessage={`Failed to load users: ${(error as Error)?.message || 'Unknown error'}`}
          emptyTitle="No Users Created"
          emptyDescription="Create your first user to assign roles, departments, and project access"
          emptyIcon="solar:users-group-rounded-bold-duotone"
          createAction={{ icon: 'solar:add-circle-bold', label: 'Create User', onClick: () => navigate(paths.dashboard.userNew) }}
        />
      </PageContainer>
    </>
  );
}
