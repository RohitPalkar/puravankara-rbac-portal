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
import { CONFIG } from 'src/config-global';
import { DataTable } from 'src/components/data-table';
import { Form, Field } from 'src/components/hook-form';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { PageContainer, PageHeader } from 'src/components/page-layout';
import { mockRoles, mockDepartments } from 'src/services/mock-data';
import type { Role } from 'src/types';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const DEPT_OPTIONS = mockDepartments.map((d) => ({ value: d.id, label: d.name }));

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required').max(20, 'Max 20 chars'),
  description: z.string().default(''),
  departmentId: z.string().min(1, 'Department is required'),
  status: z.enum(['active', 'inactive']),
});

type FormData = z.infer<typeof schema>;
const defaults: FormData = { name: '', code: '', description: '', departmentId: '', status: 'active' };

export default function RoleListPage() {
  const [data, setData] = useState<Role[]>(mockRoles);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const methods = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: defaults });

  const handleNew = useCallback(() => {
    setEditing(null);
    methods.reset(defaults);
    setOpen(true);
  }, [methods]);

  const handleEdit = useCallback((row: Role) => {
    setEditing(row);
    methods.reset({ name: row.name, code: row.code, description: row.description, departmentId: row.departmentId, status: row.status });
    setOpen(true);
  }, [methods]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setEditing(null);
  }, []);

  const onSubmit = useCallback((form: FormData) => {
    const dept = mockDepartments.find((d) => d.id === form.departmentId);
    if (editing) {
      setData((prev) => prev.map((item) => (item.id === editing.id ? { ...item, ...form, departmentName: dept?.name } : item)));
    } else {
      setData((prev) => [{ id: String(Date.now()), ...form, departmentName: dept?.name, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...prev]);
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
    { field: 'name', headerName: 'Role Name', flex: 1 },
    { field: 'code', headerName: 'Code', width: 130 },
    { field: 'departmentName', headerName: 'Department', width: 170 },
    { field: 'description', headerName: 'Description', flex: 1 },
    {
      field: 'status', headerName: 'Status', width: 100,
      renderCell: (params) => (
        <Label color={params.value === 'active' ? 'success' : 'default'}>{params.value}</Label>
      ),
    },
    {
      field: 'actions', headerName: '', width: 120, sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Button size="small" variant="soft" onClick={() => handleEdit(params.row)}>
            <Iconify icon="solar:pen-bold" width={16} />
          </Button>
          <Button size="small" variant="soft" color="error" onClick={() => setDeleteId(params.row.id)}>
            <Iconify icon="solar:trash-bin-trash-bold" width={16} />
          </Button>
        </Stack>
      ),
    },
  ];

  return (
    <>
      <Helmet><title>Roles - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader title="Roles" description="Manage roles and permissions" action={
          <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={handleNew}>
            Add Role
          </Button>
        } />
        <Card sx={{ overflow: 'hidden' }}>
          <DataTable columns={columns} rows={data} getRowId={(r) => r.id} />
        </Card>
      </PageContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Role' : 'Create Role'}</DialogTitle>
        <Form methods={methods} onSubmit={methods.handleSubmit(onSubmit)}>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <Field.Text name="name" label="Role Name" />
              <Field.Text name="code" label="Role Code" />
              <Field.Text name="description" label="Description" multiline rows={2} />
              <Field.Select name="departmentId" label="Department" options={DEPT_OPTIONS} />
              <Field.Select name="status" label="Status" options={STATUS_OPTIONS} />
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
        <DialogContent>Are you sure you want to delete this role?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} color="inherit">Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
