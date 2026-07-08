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
import { mockDelegations, mockUsers } from 'src/services/mock-data';
import type { Delegation } from 'src/types';

const schema = z.object({
  delegatorId: z.string().min(1, 'Delegator is required'),
  delegateId: z.string().min(1, 'Delegate is required'),
  module: z.string().min(1, 'Module is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  isActive: z.enum(['active', 'inactive']),
});

type FormData = z.infer<typeof schema>;
const defaults: FormData = { delegatorId: '', delegateId: '', module: '', startDate: '', endDate: '', isActive: 'active' };

const MODULE_OPTIONS = [
  { value: 'Finance', label: 'Finance' },
  { value: 'HR', label: 'HR' },
  { value: 'Procurement', label: 'Procurement' },
  { value: 'Projects', label: 'Projects' },
];

export default function DelegationsPage() {
  const [data, setData] = useState<Delegation[]>(mockDelegations);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Delegation | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const methods = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: defaults });

  const userOptions = mockUsers.map((u) => ({ value: u.id, label: u.name }));

  const handleNew = useCallback(() => {
    setEditing(null);
    methods.reset(defaults);
    setOpen(true);
  }, [methods]);

  const handleEdit = useCallback((row: Delegation) => {
    setEditing(row);
    methods.reset({ delegatorId: row.delegatorId, delegateId: row.delegateId, module: row.module, startDate: row.startDate, endDate: row.endDate, isActive: row.isActive ? 'active' : 'inactive' });
    setOpen(true);
  }, [methods]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setEditing(null);
  }, []);

  const getUserName = (id: string) => mockUsers.find((u) => u.id === id)?.name ?? id;

  const onSubmit = useCallback((form: FormData) => {
    if (editing) {
      setData((prev) => prev.map((item) => (item.id === editing.id ? {
        ...item, ...form, isActive: form.isActive === 'active',
        delegatorName: getUserName(form.delegatorId), delegateName: getUserName(form.delegateId),
      } : item)));
    } else {
      setData((prev) => [{
        id: String(Date.now()), ...form, isActive: form.isActive === 'active',
        delegatorName: getUserName(form.delegatorId), delegateName: getUserName(form.delegateId),
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

  const columns: GridColDef[] = [
    { field: 'delegatorName', headerName: 'Delegator', flex: 1 },
    { field: 'delegateName', headerName: 'Delegate', flex: 1 },
    { field: 'module', headerName: 'Module', width: 130 },
    { field: 'startDate', headerName: 'Start Date', width: 110 },
    { field: 'endDate', headerName: 'End Date', width: 110 },
    {
      field: 'isActive', headerName: 'Status', width: 100,
      renderCell: (params) => (
        <Label color={params.value ? 'success' : 'default'}>{params.value ? 'Active' : 'Inactive'}</Label>
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
      <Helmet><title>Delegations - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader title="Delegations" description="Manage authority delegations" action={
          <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={handleNew}>
            Add Delegation
          </Button>
        } />
        <Card sx={{ overflow: 'hidden' }}>
          <DataTable columns={columns} rows={data} getRowId={(r) => r.id} />
        </Card>
      </PageContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Delegation' : 'Create Delegation'}</DialogTitle>
        <Form methods={methods} onSubmit={methods.handleSubmit(onSubmit)}>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <Field.Select name="delegatorId" label="Delegator" options={userOptions} />
              <Field.Select name="delegateId" label="Delegate" options={userOptions} />
              <Field.Select name="module" label="Module" options={MODULE_OPTIONS} />
              <Field.Text name="startDate" label="Start Date" placeholder="YYYY-MM-DD" />
              <Field.Text name="endDate" label="End Date" placeholder="YYYY-MM-DD" />
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
        <DialogContent>Are you sure you want to delete this delegation?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} color="inherit">Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
