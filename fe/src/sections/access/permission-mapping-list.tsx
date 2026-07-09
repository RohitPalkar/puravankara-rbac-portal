import { useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import type { GridColDef } from '@mui/x-data-grid';
import { CONFIG } from 'src/config-global';
import { PageContainer, PageHeader } from 'src/components/page-layout';
import { DataTable } from 'src/components/data-table';
import type { FilterOption } from 'src/components/data-table';
import { RowActionsMenu } from 'src/components/row-actions';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { mockPermissionMappings } from 'src/services/mock-data';
import { paths } from 'src/routes/paths';

export default function PermissionMappingListPage() {
  const navigate = useNavigate();

  const handleView = useCallback((id: string) => {
    navigate(paths.dashboard.permissionView(id));
  }, [navigate]);

  const handleEdit = useCallback((id: string) => {
    navigate(paths.dashboard.permissionEdit(id));
  }, [navigate]);

  const handleClone = useCallback(() => {
    navigate(paths.dashboard.permissionNew);
  }, [navigate]);

  const handleDeactivate = useCallback((id: string) => {
    const idx = mockPermissionMappings.findIndex((m) => m.id === id);
    if (idx !== -1) {
      mockPermissionMappings.splice(idx, 1);
      navigate(paths.dashboard.permissionMatrix);
    }
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
        const row = params.row;
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

        {mockPermissionMappings.length === 0 ? (
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
            rows={mockPermissionMappings}
            searchPlaceholder="Search by department, role..."
            filterOptions={[
              {
                key: 'departmentName',
                label: 'Department',
                options: [...new Set(mockPermissionMappings.map((r) => r.departmentName))].map((name) => ({ value: name, label: name })),
              },
              {
                key: 'level',
                label: 'Level',
                options: [...new Set(mockPermissionMappings.map((r) => r.level))].sort().map((l) => ({ value: l, label: l })),
              },
            ]}
          />
        )}
      </PageContainer>
    </>
  );
}