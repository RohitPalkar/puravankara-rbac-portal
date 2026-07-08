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
import { useNavigate } from 'react-router-dom';
import { CONFIG } from 'src/config-global';
import { DataTable } from 'src/components/data-table';
import { Form, Field } from 'src/components/hook-form';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { PageContainer, PageHeader } from 'src/components/page-layout';
import { RowActionsMenu } from 'src/components/row-actions';
import { mockUsers, mockDepartments, mockRoles, mockProjects } from 'src/services/mock-data';
import type { User } from 'src/types';
import { paths } from 'src/routes/paths';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const DEPT_OPTIONS = mockDepartments.map((d) => ({ value: d.id, label: d.name }));
const ROLE_OPTIONS = mockRoles.map((r) => ({ value: r.id, label: r.name }));

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(1, 'Phone is required'),
  departmentId: z.string().min(1, 'Department is required'),
  roleId: z.string().min(1, 'Role is required'),
  status: z.enum(['active', 'inactive']),
});

type FormData = z.infer<typeof schema>;
const defaults: FormData = { name: '', email: '', phone: '', departmentId: '', roleId: '', status: 'active' };

export default function UserListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<User[]>(mockUsers);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const methods = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: defaults });

  const handleNew = useCallback(() => {
    navigate(paths.dashboard.userNew);
  }, [navigate]);

  const handleEdit = useCallback((row: User) => {
    setEditing(row);
    methods.reset({ name: row.name, email: row.email, phone: row.phone, departmentId: row.departmentId, roleId: row.roleId, status: row.status });
    setOpen(true);
  }, [methods]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setEditing(null);
  }, []);

  const onSubmit = useCallback((form: FormData) => {
    const dept = mockDepartments.find((d) => d.id === form.departmentId);
    const role = mockRoles.find((r) => r.id === form.roleId);
    if (editing) {
      setData((prev) => prev.map((item) => (item.id === editing.id ? { ...item, ...form, departmentName: dept?.name, roleName: role?.name } : item)));
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
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'email', headerName: 'Email', width: 220 },
    { field: 'departmentName', headerName: 'Department', width: 170 },
    { field: 'roleName', headerName: 'Role', width: 150 },
    { field: 'phone', headerName: 'Phone', width: 150 },
    {
      field: 'status', headerName: 'Status', width: 100,
      renderCell: (params) => (
        <Label color={params.value === 'active' ? 'success' : 'default'}>{params.value}</Label>
      ),
    },
    {
      field: 'actions', headerName: '', width: 60, sortable: false, disableColumnMenu: true,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'center', width: 1 }}>
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
      <Helmet><title>Users - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader title="Users" description="Manage user accounts" action={
          <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={handleNew}>
            Add User
          </Button>
        } />
        <Card sx={{ overflow: 'hidden' }}>
          <DataTable columns={columns} rows={data} getRowId={(r) => r.id} onRowClick={(row) => navigate(paths.dashboard.userDetail(row.id))} />
        </Card>
      </PageContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <Form methods={methods} onSubmit={methods.handleSubmit(onSubmit)}>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <Field.Text name="name" label="Name" />
              <Field.Text name="email" label="Email" />
              <Field.Text name="phone" label="Phone" />
              <Field.Select name="departmentId" label="Department" options={DEPT_OPTIONS} />
              <Field.Select name="roleId" label="Role" options={ROLE_OPTIONS} />
              <Field.Select name="status" label="Status" options={STATUS_OPTIONS} />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained">Update</Button>
          </DialogActions>
        </Form>
      </Dialog>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs">
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this user?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} color="inherit">Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
