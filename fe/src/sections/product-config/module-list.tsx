import type { Module } from 'src/types';
import type { GridColDef } from '@mui/x-data-grid';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import { useState, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { CONFIG } from 'src/config-global';
import { mockModules } from 'src/services/mock-data';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { DataTable } from 'src/components/data-table';
import { Form, Field } from 'src/components/hook-form';
import { RowActionsMenu } from 'src/components/row-actions';
import { PageHeader, PageContainer } from 'src/components/page-layout';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required').max(20, 'Max 20 chars'),
  icon: z.string().default(''),
  sortOrder: z.coerce.number().int().min(0),
});

type FormData = z.infer<typeof schema>;
const defaults: FormData = { name: '', code: '', icon: '', sortOrder: 0 };

export default function ModuleListPage() {
  const [data, setData] = useState<Module[]>(mockModules);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Module | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const methods = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: defaults });

  const handleNew = useCallback(() => {
    setEditing(null);
    methods.reset(defaults);
    setOpen(true);
  }, [methods]);

  const handleEdit = useCallback((row: Module) => {
    setEditing(row);
    methods.reset({ name: row.name, code: row.code, icon: row.icon, sortOrder: row.sortOrder });
    setOpen(true);
  }, [methods]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setEditing(null);
  }, []);

  const onSubmit = useCallback((form: FormData) => {
    if (editing) {
      setData((prev) => prev.map((item) => (item.id === editing.id ? { ...item, ...form } : item)));
    } else {
      setData((prev) => [{ id: String(Date.now()), ...form, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...prev]);
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
    { field: 'name', headerName: 'Module Name', flex: 1 },
    { field: 'code', headerName: 'Code', width: 150 },
    { field: 'sortOrder', headerName: 'Sort Order', width: 100 },
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
      <Helmet><title>Modules - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader title="Modules" description="Manage system modules" action={
          <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={handleNew}>
            Add Module
          </Button>
        } />
        <Card sx={{ overflow: 'hidden' }}>
          <DataTable columns={columns} rows={data} getRowId={(r) => r.id} />
        </Card>
      </PageContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Module' : 'Create Module'}</DialogTitle>
        <Form methods={methods} onSubmit={methods.handleSubmit(onSubmit)}>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <Field.Text name="name" label="Module Name" />
              <Field.Text name="code" label="Module Code" />
              <Field.Text name="icon" label="Icon (Iconify name)" />
              <Field.Text name="sortOrder" label="Sort Order" type="number" />
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
        <DialogContent>Are you sure you want to delete this module?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} color="inherit">Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
