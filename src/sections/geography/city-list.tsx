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
import { mockCities, mockZones } from 'src/services/mock-data';
import type { City } from 'src/types';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const ZONE_OPTIONS = mockZones.map((zn) => ({ value: zn.id, label: zn.name }));

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required').max(10, 'Max 10 chars'),
  zoneId: z.string().min(1, 'Zone is required'),
  status: z.enum(['active', 'inactive']),
});

type FormData = z.infer<typeof schema>;
const defaults: FormData = { name: '', code: '', zoneId: '', status: 'active' };

export default function CityListPage() {
  const [data, setData] = useState<City[]>(mockCities);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<City | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const methods = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: defaults });

  const handleNew = useCallback(() => {
    setEditing(null);
    methods.reset(defaults);
    setOpen(true);
  }, [methods]);

  const handleEdit = useCallback((row: City) => {
    setEditing(row);
    methods.reset({ name: row.name, code: row.code, zoneId: row.zoneId, status: row.status });
    setOpen(true);
  }, [methods]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setEditing(null);
  }, []);

  const onSubmit = useCallback((form: FormData) => {
    const zone = mockZones.find((zn) => zn.id === form.zoneId);
    if (editing) {
      setData((prev) => prev.map((item) => (item.id === editing.id ? { ...item, ...form, zoneName: zone?.name } : item)));
    } else {
      setData((prev) => [{ id: String(Date.now()), ...form, zoneName: zone?.name, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...prev]);
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
    { field: 'name', headerName: 'City Name', flex: 1 },
    { field: 'code', headerName: 'Code', width: 100 },
    { field: 'zoneName', headerName: 'Zone', width: 150 },
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
      <Helmet><title>Cities - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader title="Cities" description="Manage city master data" action={
          <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={handleNew}>
            Add City
          </Button>
        } />
        <Card sx={{ overflow: 'hidden' }}>
          <DataTable columns={columns} rows={data} getRowId={(r) => r.id} />
        </Card>
      </PageContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit City' : 'Create City'}</DialogTitle>
        <Form methods={methods} onSubmit={methods.handleSubmit(onSubmit)}>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <Field.Text name="name" label="City Name" />
              <Field.Text name="code" label="City Code" />
              <Field.Select name="zoneId" label="Zone" options={ZONE_OPTIONS} />
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
        <DialogContent>Are you sure you want to delete this city?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} color="inherit">Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
