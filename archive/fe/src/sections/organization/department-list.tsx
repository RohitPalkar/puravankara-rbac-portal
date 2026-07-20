import type { Department } from 'src/types';
import type { GridColDef } from '@mui/x-data-grid';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import { zodResolver } from '@hookform/resolvers/zod';
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

import { CONFIG } from 'src/config-global';
import { mockUsers } from 'src/services/mock-data';
import { isApiMode } from 'src/services/data-source';
import { useDepartments } from 'src/services/api-adapters';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { DataTable } from 'src/components/data-table';
import { Form, Field } from 'src/components/hook-form';
import { RowActionsMenu } from 'src/components/row-actions';
import { PageHeader, PageContainer } from 'src/components/page-layout';

const schema = z.object({
  name: z.string().min(1, 'Department Name is required'),
  maxHierarchyLevels: z.coerce.number().int().min(1, 'Minimum 1 level').max(20, 'Maximum 20 levels'),
});

type FormData = z.infer<typeof schema>;
const defaults: FormData = { name: '', maxHierarchyLevels: 7 };

export default function DepartmentListPage() {
  const { data: apiData, loading, error, refetch } = useDepartments();
  const [data, setData] = useState<Department[]>([]);
  useEffect(() => { setData(apiData); }, [apiData]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const methods = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: defaults });

  const getUserCount = (deptId: string) => mockUsers.filter((u) => u.departmentId === deptId).length;

  const handleNew = useCallback(() => {
    setEditing(null);
    methods.reset(defaults);
    setOpen(true);
  }, [methods]);

  const handleEdit = useCallback((row: Department) => {
    setEditing(row);
    methods.reset({ name: row.name, maxHierarchyLevels: row.maxHierarchyLevels });
    setOpen(true);
  }, [methods]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setEditing(null);
  }, []);

  const onSubmit = useCallback(async (form: FormData) => {
    if (isApiMode()) {
      try {
        const { departmentApi } = await import('src/services/api/department-api');
        if (editing) {
          await departmentApi.update(editing.id, { name: form.name, maxHierarchyLevels: form.maxHierarchyLevels });
        } else {
          await departmentApi.create({ name: form.name, maxHierarchyLevels: form.maxHierarchyLevels });
        }
        refetch();
      } catch (e) { console.error(e); }
    } else if (editing) {
      setData((prev) => prev.map((item) => (item.id === editing.id ? { ...item, name: form.name, maxHierarchyLevels: form.maxHierarchyLevels, updatedAt: new Date().toISOString() } : item)));
    } else {
      setData((prev) => [{
        id: String(Date.now()),
        name: form.name,
        maxHierarchyLevels: form.maxHierarchyLevels,
        createdBy: 'You',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }, ...prev]);
    }
    handleClose();
  }, [editing, handleClose, refetch]);

  const handleDelete = useCallback(async () => {
    if (deleteId) {
      if (isApiMode()) {
        try {
          const { departmentApi } = await import('src/services/api/department-api');
          await departmentApi.remove(deleteId);
          refetch();
        } catch (e) { console.error(e); }
      } else {
        setData((prev) => prev.filter((item) => item.id !== deleteId));
      }
      setDeleteId(null);
    }
  }, [deleteId, refetch]);



  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Department Name', flex: 1, minWidth: 180 },
    { field: 'maxHierarchyLevels', headerName: 'Hierarchy Levels', width: 140 },
    {
      field: 'userCount', headerName: 'Users Count', width: 110,
      renderCell: (params) => {
        const count = getUserCount(params.row.id);
        return <Typography variant="body2">{count}</Typography>;
      },
    },
    {
      field: 'status', headerName: 'Status', width: 100,
      renderCell: (params) => (
        <Label color={params.value === 'active' ? 'success' : 'default'}>{params.value}</Label>
      ),
    },
    {
      field: 'actions', headerName: '', width: 60, sortable: false, disableColumnMenu: true,
      renderCell: (params) => (
        <Stack alignItems="center" sx={{ height: 1, justifyContent: 'center' }}>
          <RowActionsMenu actions={[
            { label: 'Edit', icon: 'solar:pen-bold', onClick: () => handleEdit(params.row) },
            { label: 'Delete', icon: 'solar:trash-bin-trash-bold', onClick: () => setDeleteId(params.row.id), color: 'error.main' },
          ]} />
        </Stack>
      ),
    },
  ];

  return (
    <>
      <Helmet><title>Departments - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader title="Departments" description="Manage organizational departments and hierarchy levels" action={
          <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={handleNew}>
            Add Department
          </Button>
        } />
        <Card sx={{ overflow: 'hidden' }}>
          <DataTable columns={columns} rows={data} getRowId={(r) => r.id} />
        </Card>
        {data.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Iconify icon="solar:buildings-bold" width={48} sx={{ color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">No Departments Created</Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
              Create your first department to start building your organization structure.
            </Typography>
            <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={handleNew}>
              Add Department
            </Button>
          </Box>
        )}
      </PageContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Department' : 'Create Department'}</DialogTitle>
        <Form methods={methods} onSubmit={methods.handleSubmit(onSubmit)}>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <Field.Text name="name" label="Department Name" placeholder="e.g. Finance" />
              <Field.Text
                name="maxHierarchyLevels"
                label="Number of Hierarchy Levels"
                type="number"
                placeholder="e.g. 7"
                helperText="Defines the maximum hierarchy depth available for this department (max 20)."
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained">{editing ? 'Update' : 'Create'}</Button>
          </DialogActions>
        </Form>
      </Dialog>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs">
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this department?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} color="inherit">Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
