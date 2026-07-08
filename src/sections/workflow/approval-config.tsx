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
import { RowActionsMenu } from 'src/components/row-actions';
import { mockApprovalConfigs, mockRoles } from 'src/services/mock-data';
import type { ApprovalConfig } from 'src/types';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  module: z.string().min(1, 'Module is required'),
  description: z.string().min(1, 'Description is required'),
  approverRoleId: z.string().min(1, 'Approver role is required'),
  stages: z.coerce.number().min(1, 'Min 1 stage'),
  isActive: z.enum(['active', 'inactive']),
});

type FormData = z.infer<typeof schema>;
const defaults: FormData = { name: '', module: '', description: '', approverRoleId: '', stages: 1, isActive: 'active' };

export default function ApprovalConfigPage() {
  const [data, setData] = useState<ApprovalConfig[]>(mockApprovalConfigs);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ApprovalConfig | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const methods = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: defaults });

  const handleNew = useCallback(() => {
    setEditing(null);
    methods.reset(defaults);
    setOpen(true);
  }, [methods]);

  const handleEdit = useCallback((row: ApprovalConfig) => {
    setEditing(row);
    methods.reset({ name: row.name, module: row.module, description: row.description, approverRoleId: row.approverRoleId, stages: row.stages, isActive: row.isActive ? 'active' : 'inactive' });
    setOpen(true);
  }, [methods]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setEditing(null);
  }, []);

  const onSubmit = useCallback((form: FormData) => {
    const role = mockRoles.find((r) => r.id === form.approverRoleId);
    if (editing) {
      setData((prev) => prev.map((item) => (item.id === editing.id ? { ...item, ...form, isActive: form.isActive === 'active', approverRoleName: role?.name } : item)));
    } else {
      setData((prev) => [{
        id: String(Date.now()), ...form, isActive: form.isActive === 'active', approverRoleName: role?.name,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
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

  const MODULE_OPTIONS = [
    { value: 'Procurement', label: 'Procurement' },
    { value: 'HR', label: 'HR' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Projects', label: 'Projects' },
  ];

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'module', headerName: 'Module', width: 130 },
    { field: 'description', headerName: 'Description', flex: 1 },
    { field: 'approverRoleName', headerName: 'Approver Role', width: 150 },
    { field: 'stages', headerName: 'Stages', width: 80 },
    {
      field: 'isActive', headerName: 'Status', width: 100,
      renderCell: (params) => (
        <Label color={params.value ? 'success' : 'default'}>{params.value ? 'Active' : 'Inactive'}</Label>
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
      <Helmet><title>Approval Configuration - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader title="Approval Configuration" description="Define approval workflows" action={
          <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={handleNew}>
            Add Workflow
          </Button>
        } />
        <Card sx={{ overflow: 'hidden' }}>
          <DataTable columns={columns} rows={data} getRowId={(r) => r.id} />
        </Card>
      </PageContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Approval Workflow' : 'Create Approval Workflow'}</DialogTitle>
        <Form methods={methods} onSubmit={methods.handleSubmit(onSubmit)}>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <Field.Text name="name" label="Workflow Name" />
              <Field.Select name="module" label="Module" options={MODULE_OPTIONS} />
              <Field.Text name="description" label="Description" multiline rows={2} />
              <Field.Select name="approverRoleId" label="Approver Role" options={mockRoles.map((r) => ({ value: r.id, label: r.name }))} />
              <Field.Text name="stages" label="Approval Stages" type="number" />
              <Field.Select name="isActive" label="Status" options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
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
        <DialogContent>Are you sure you want to delete this approval workflow?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} color="inherit">Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
