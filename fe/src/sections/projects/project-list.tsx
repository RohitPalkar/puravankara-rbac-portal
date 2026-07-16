import type { Project } from 'src/types';
import type { GridColDef } from '@mui/x-data-grid';

import dayjs from 'dayjs';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { isApiMode } from 'src/services/data-source';
import { useProjects } from 'src/services/api-adapters';

import { Can } from 'src/components/can';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { DataTable } from 'src/components/data-table';
import { RowActionsMenu } from 'src/components/row-actions';
import { PageHeader, PageContainer } from 'src/components/page-layout';

export default function ProjectListPage() {
  const navigate = useNavigate();
  const { data: apiData, loading, error, refetch } = useProjects();
  const [data, setData] = useState<Project[]>([]);
  useEffect(() => { setData(apiData); }, [apiData]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = useCallback(async () => {
    if (deleteId) {
      if (isApiMode()) {
        try {
          const { projectApi } = await import('src/services/api/project-api');
          await projectApi.remove(deleteId);
          refetch();
        } catch (e) { console.error(e); }
      } else {
        setData((prev) => prev.filter((item) => item.id !== deleteId));
      }
      setDeleteId(null);
    }
  }, [deleteId, refetch]);

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Project Name', flex: 1, minWidth: 200 },
    { field: 'code', headerName: 'Code', width: 90 },
    { field: 'brand', headerName: 'Brand', width: 130 },
    { field: 'zoneName', headerName: 'Zone', width: 150 },
    { field: 'cityName', headerName: 'City', width: 130 },
    { field: 'phase', headerName: 'Phase', width: 100 },
    {
      field: 'status', headerName: 'Status', width: 100,
      renderCell: (params) => (
        <Label color={params.value === 'active' ? 'success' : 'default'}>{params.value}</Label>
      ),
    },
    {
      field: 'createdAt', headerName: 'Created Date', width: 120,
      renderCell: (params) => dayjs(params.value).format('DD/MM/YYYY'),
    },
    {
      field: 'actions', headerName: '', width: 60, sortable: false, disableColumnMenu: true,
      renderCell: (params) => (
        <Stack alignItems="center" sx={{ height: 1, justifyContent: 'center' }}>
          <RowActionsMenu moduleCode="PROJECTS" actions={[
            { label: 'View', icon: 'solar:eye-bold', action: 'VIEW', onClick: () => navigate(paths.dashboard.projectDetail(params.row.id)) },
            { label: 'Edit', icon: 'solar:pen-bold', action: 'EDIT', onClick: () => navigate(paths.dashboard.projectEdit(params.row.id)) },
            { label: 'Deactivate', icon: 'solar:lock-bold', action: 'DELETE', onClick: () => {}, color: 'error.main' },
          ]} />
        </Stack>
      ),
    },
  ];

  return (
    <>
      <Helmet><title>Projects - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader title="Projects" description="Manage project master data with zone and city assignments" action={
          <Can module="PROJECTS" action="CREATE">
            <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={() => navigate(paths.dashboard.projectNew)}>
              Add Project
            </Button>
          </Can>
        } />
        <Card sx={{ overflow: 'hidden' }}>
          <DataTable columns={columns} rows={data} getRowId={(r) => r.id} />
        </Card>
        {data.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Iconify icon="solar:folder-bold" width={48} sx={{ color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">No Projects Found</Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
              Create your first project to assign access.
            </Typography>
            <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={() => navigate(paths.dashboard.projectNew)}>
              Add Project
            </Button>
          </Box>
        )}
      </PageContainer>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs">
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this project?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} color="inherit">Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
