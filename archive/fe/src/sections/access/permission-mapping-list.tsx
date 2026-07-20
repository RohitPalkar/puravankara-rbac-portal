import type { GridColDef } from '@mui/x-data-grid';
import type { PermissionMapping } from 'src/types';

import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { isApiMode } from 'src/services/data-source';
import { usePermissionMappings } from 'src/services/api-adapters';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { DataTable } from 'src/components/data-table';
import { RowActionsMenu } from 'src/components/row-actions';
import { PageHeader, PageContainer } from 'src/components/page-layout';

export default function PermissionMappingListPage() {
  const navigate = useNavigate();
  const { data: apiData, loading, error, refetch } = usePermissionMappings();
  const [data, setData] = useState<PermissionMapping[]>([]);
  useEffect(() => { setData(apiData); }, [apiData]);

  const handleView = useCallback((id: string) => {
    navigate(paths.dashboard.permissionView(id));
  }, [navigate]);

  const handleEdit = useCallback((id: string) => {
    navigate(paths.dashboard.permissionEdit(id));
  }, [navigate]);

  const handleClone = useCallback(() => {
    navigate(paths.dashboard.permissionNew);
  }, [navigate]);

  const handleDeactivate = useCallback(async (id: string) => {
    if (!isApiMode()) {
      setData((prev) => prev.filter((m) => m.id !== id));
    }
    navigate(paths.dashboard.permissionMatrix);
  }, [navigate]);

  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'departmentName',
      headerName: 'Department',
      flex: 1,
      minWidth: 160,
      renderCell: (params: any) => (
        <Typography variant="body2" fontWeight={600}>{params.value}</Typography>
      ),
    },
    {
      field: 'level',
      headerName: 'Level',
      width: 90,
      renderCell: (params: any) => (
        <Label color="primary" variant="soft">{params.value}</Label>
      ),
    },
    {
      field: 'roleName',
      headerName: 'Role',
      flex: 1,
      minWidth: 160,
    },
    {
      field: 'modules',
      headerName: 'Modules',
      width: 130,
      renderCell: (params: any) => {
        const count = params.value?.length ?? 0;
        return (
          <Typography variant="body2">{count} module{count !== 1 ? 's' : ''}</Typography>
        );
      },
    },
    {
      field: 'permissionsCount',
      headerName: 'Permissions',
      width: 130,
      renderCell: (params: any) => {
        const {row} = params;
        const count = row.modules?.reduce(
          (acc: number, m: any) => acc + m.subModules.reduce((a: number, sm: any) => a + sm.actionIds.length, 0),
          0
        ) ?? 0;
        return <Typography variant="body2">{count}</Typography>;
      },
    },
    {
      field: 'createdBy',
      headerName: 'Created By',
      width: 140,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      renderCell: (params: any) => (
        <Label color="success">Active</Label>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 70,
      sortable: false,
      renderCell: (params: any) => (
        <RowActionsMenu
          actions={[
            { label: 'View', icon: 'solar:eye-bold', onClick: () => handleView(params.row.id) },
            { label: 'Edit', icon: 'solar:pen-bold', onClick: () => handleEdit(params.row.id) },
            { label: 'Clone', icon: 'solar:copy-bold', onClick: () => handleClone() },
            { label: 'Deactivate', icon: 'solar:close-circle-bold', color: 'error.main', onClick: () => handleDeactivate(params.row.id) },
          ]}
        />
      ),
    },
  ], [handleView, handleEdit, handleClone, handleDeactivate]);

  return (
    <>
      <Helmet><title>Permission Mapping - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader
          title="Permission Mapping"
          description="Department → Level → Role permission templates for user assignment"
          action={
            <Button
              variant="contained"
              startIcon={<Iconify icon="solar:add-circle-bold" />}
              onClick={() => navigate(paths.dashboard.permissionNew)}
            >
              Create Permission Mapping
            </Button>
          }
        />

        {data.length === 0 ? (
          <Card sx={{ p: 6, textAlign: 'center' }}>
            <Iconify icon="solar:shield-check-bold" width={48} color="text.disabled" />
            <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
              No Permission Mappings Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Create a mapping to define role-based access templates.
            </Typography>
            <Button variant="contained" onClick={() => navigate(paths.dashboard.permissionNew)}>
              Create Permission Mapping
            </Button>
          </Card>
        ) : (
          <DataTable
            columns={columns}
            rows={data}
            searchPlaceholder="Search by department, role..."
            filterOptions={[
              {
                key: 'departmentName',
                label: 'Department',
                options: [...new Set(data.map((r) => r.departmentName))].map((name) => ({ value: name, label: name })),
              },
              {
                key: 'level',
                label: 'Level',
                options: [...new Set(data.map((r) => r.level))].sort().map((l) => ({ value: l, label: l })),
              },
            ]}
          />
        )}
      </PageContainer>
    </>
  );
}