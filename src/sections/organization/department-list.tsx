import { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import type { GridColDef } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Card from '@mui/material/Card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from 'dayjs';
import { CONFIG } from 'src/config-global';
import { DataTable } from 'src/components/data-table';
import { Form, Field } from 'src/components/hook-form';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { PageContainer, PageHeader } from 'src/components/page-layout';
import { RowActionsMenu } from 'src/components/row-actions';
import { mockDepartments } from 'src/services/mock-data';
import type { Department } from 'src/types';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const schema = z.object({
  name: z.string().min(1, 'Department Name is required'),
  maxHierarchyLevels: z.coerce.number().int().min(1, 'Minimum 1 level').max(10, 'Maximum 10 levels'),
  status: z.enum(['active', 'inactive']),
});

type FormData = z.infer<typeof schema>;
const defaults: FormData = { name: '', maxHierarchyLevels: 7, status: 'active' };

function generateCode(name: string, existing: Department[]): string {
  const prefix = name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 3);
  const existingCodes = existing.map((d) => d.code);
  let code = prefix;
  let i = 1;
  while (existingCodes.includes(code)) {
    code = `${prefix}${i}`;
    i += 1;
  }
  return code;
}

export default function DepartmentListPage() {
  const [data, setData] = useState<Department[]>(mockDepartments);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const methods = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: defaults });

  const handleNew = useCallback(() => {
    setEditing(null);
    methods.reset(defaults);
    setOpen(true);
  }, [methods]);

  const handleEdit = useCallback((row: Department) => {
    setEditing(row);
    methods.reset({ name: row.name, maxHierarchyLevels: row.maxHierarchyLevels, status: row.status });
    setOpen(true);
  }, [methods]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setEditing(null);
  }, []);

  const onSubmit = useCallback((form: FormData) => {
    if (editing) {
      setData((prev) => prev.map((item) => (item.id === editing.id ? { ...item, name: form.name, maxHierarchyLevels: form.maxHierarchyLevels, status: form.status, updatedAt: new Date().toISOString() } : item)));
    } else {
      setData((prev) => [{
        id: String(Date.now()),
        name: form.name,
        code: generateCode(form.name, prev),
        maxHierarchyLevels: form.maxHierarchyLevels,
        createdBy: 'You',
        status: form.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }, ...prev]);
    }
    handleClose();
  }, [editing, handleClose]);

  const handleDelete = useCallback(() => {
    if (deleteId) {
      setData((prev) => prev.filter((item) => item.id !== deleteId));
      setDeleteId(null);
    }
  }, [deleteId]);

  const columns: GridColDef[] = [
    { field: 'code', headerName: 'ID', width: 80 },
    { field: 'name', headerName: 'Department Name', flex: 1 },
    { field: 'maxHierarchyLevels', headerName: 'Levels', width: 90 },
    { field: 'createdBy', headerName: 'Created By', width: 130 },
    {
      field: 'createdAt', headerName: 'Created Date', width: 120,
      renderCell: (params) => dayjs(params.value).format('DD/MM/YYYY'),
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
      </PageContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Department' : 'Create Department'}</DialogTitle>
        <Form methods={methods} onSubmit={methods.handleSubmit(onSubmit)}>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <Field.Text name="name" label="Department Name" placeholder="e.g. Finance" />
              <Field.Text
                name="maxHierarchyLevels"
                label="Number of Levels"
                type="number"
                placeholder="e.g. 7"
                helperText="Defines the maximum hierarchy depth available for this department."
              />
              {editing && <Field.Select name="status" label="Status" options={STATUS_OPTIONS} />}
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