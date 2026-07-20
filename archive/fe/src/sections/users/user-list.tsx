import type { User } from 'src/types';
import type { GridColDef } from '@mui/x-data-grid';

import dayjs from 'dayjs';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { useUsers } from 'src/services/api-adapters';
import { isApiMode } from 'src/services/data-source';

import { Can } from 'src/components/can';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { DataTable } from 'src/components/data-table';
import { RowActionsMenu } from 'src/components/row-actions';
import { PageHeader, PageContainer } from 'src/components/page-layout';

export default function UserListPage() {
  const navigate = useNavigate();
  const { data: apiData, loading, error, refetch } = useUsers();
  const [data, setData] = useState<User[]>([]);
  useEffect(() => { setData(apiData); }, [apiData]);

  const columns: GridColDef[] = useMemo(() => [
    { field: 'employeeId', headerName: 'Employee ID', width: 110 },
    { field: 'name', headerName: 'Employee Name', flex: 1, minWidth: 160 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'phone', headerName: 'Mobile', width: 130 },
    { field: 'departmentName', headerName: 'Department', width: 150 },
    { field: 'roleName', headerName: 'Primary Role', width: 140 },
    { field: 'secondaryRoleName', headerName: 'Secondary Role', width: 140, renderCell: (p: any) => p.value ?? '-' },
    {
      field: 'zoneNames', headerName: 'Zone', width: 150,
      renderCell: (p: any) => p.value?.length ? p.value.join(', ') : '-',
    },
    {
      field: 'projectsCount', headerName: 'Projects Count', width: 130,
      renderCell: (p: any) => p.row.projects?.length ?? 0,
    },
    { field: 'createdBy', headerName: 'Created By', width: 110 },
    {
      field: 'createdAt', headerName: 'Created Date', width: 120,
      renderCell: (p: any) => dayjs(p.value).format('DD/MM/YYYY'),
    },
    {
      field: 'employmentStatus', headerName: 'Employment Status', width: 150,
      renderCell: (p: any) => {
        const labels: Record<string, string> = { permanent: 'Permanent', contract: 'Contract', serving_notice_period: 'Serving Notice Period' };
        return <Label color={p.value === 'permanent' ? 'success' : p.value === 'serving_notice_period' ? 'error' : 'default'}>{labels[p.value] ?? p.value}</Label>;
      },
    },
    {
      field: 'status', headerName: 'Status', width: 100,
      renderCell: (p: any) => <Label color={p.value === 'active' ? 'success' : 'default'}>{p.value}</Label>,
    },
    {
      field: 'actions', headerName: 'Actions', width: 70, sortable: false,
      renderCell: (p: any) => (
        <RowActionsMenu moduleCode="USERS" actions={[
          { label: 'View', icon: 'solar:eye-bold', action: 'VIEW', onClick: () => navigate(paths.dashboard.userDetail(p.row.id)) },
          { label: 'Edit', icon: 'solar:pen-bold', action: 'EDIT', onClick: () => navigate(paths.dashboard.userNew) },
          { label: 'Deactivate', icon: 'solar:close-circle-bold', action: 'EDIT', color: 'error.main', onClick: async () => {
            if (isApiMode()) {
              try {
                const { userApi } = await import('src/services/api/user-api');
                await userApi.deactivate(p.row.id);
                refetch();
              } catch (e) { console.error(e); }
            } else {
              setData((prev) => prev.map((u) => u.id === p.row.id ? { ...u, status: 'inactive' as const } : u));
            }
          }},
          { label: 'Reset Password', icon: 'solar:key-bold', action: 'RESET_PASSWORD', onClick: () => {} },
        ]} />
      ),
    },
  ], [navigate, refetch]);

  return (
    <>
      <Helmet><title>Users - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader title="User Management" description="Assign who gets access and where" action={
          <Can module="USERS" action="CREATE">
            <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={() => navigate(paths.dashboard.userNew)}>
              Add User
            </Button>
          </Can>
        } />
        <Card sx={{ overflow: 'hidden' }}>
          <DataTable columns={columns} rows={data} getRowId={(r) => r.id} onRowClick={(row) => navigate(paths.dashboard.userDetail(row.id))} />
        </Card>
      </PageContainer>
    </>
  );
}