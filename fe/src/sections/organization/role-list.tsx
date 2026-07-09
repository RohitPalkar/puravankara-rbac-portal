import { useState, useCallback, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import type { GridColDef } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from 'dayjs';
import { Form, Field } from 'src/components/hook-form';
import { DataTable } from 'src/components/data-table';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { CONFIG } from 'src/config-global';
import { PageContainer, PageHeader } from 'src/components/page-layout';
import { RowActionsMenu } from 'src/components/row-actions';
import { useRoles } from 'src/services/api-adapters';
import { isApiMode } from 'src/services/data-source';
import { mockDepartments, mockUsers } from 'src/services/mock-data';
import type { Role } from 'src/types';

const DEPT_OPTIONS = mockDepartments.map((d) => ({ value: d.id, label: d.name }));

const schema = z.object({
  name: z.string().min(1, 'Role Name is required'),
  code: z.string().optional(),
  description: z.string().optional(),
  departmentId: z.string().min(1, 'Department is required'),
  level: z.string().min(1, 'Level is required'),
});

type FormData = z.infer<typeof schema>;
const defaults: FormData = { name: '', code: '', description: '', departmentId: '', level: '' };

function getLevelsForDept(deptId: string): string[] {
  const dept = mockDepartments.find((d) => d.id === deptId);
  if (!dept) return [];
  const count = dept.maxHierarchyLevels;
  return Array.from({ length: count }, (_, i) => `L${i + 1}`);
}

export default function RoleListPage() {
  const { data: apiData, loading, error, refetch } = useRoles();
  const [data, setData] = useState<Role[]>([]);
  useEffect(() => { setData(apiData); }, [apiData]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const methods = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: defaults });
  const selectedDeptId = methods.watch('departmentId');

  const levelOptions = useMemo(() => {
    const levels = getLevelsForDept(selectedDeptId);
    return levels.map((l) => ({ value: l, label: l }));
  }, [selectedDeptId]);

  const getUserCount = (roleId: string) => mockUsers.filter((u) => u.roleId === roleId).length;

  const handleNew = useCallback(() => {
    setEditing(null);
    methods.reset(defaults);
    setOpen(true);
  }, [methods]);

  const handleEdit = useCallback((row: Role) => {
    setEditing(row);
    methods.reset({ name: row.name, code: row.code ?? '', description: row.description ?? '', departmentId: row.departmentId, level: row.level });
    setOpen(true);
  }, [methods]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setEditing(null);
  }, []);

  const onSubmit = useCallback(async (form: FormData) => {
    if (isApiMode()) {
      try {
        const { roleApi } = await import('src/services/api/role-api');
        if (editing) {
          await roleApi.update(editing.id, { name: form.name, hierarchyLevelRank: parseInt(form.level.replace('L', ''), 10) });
        } else {
          await roleApi.create({ name: form.name, hierarchyLevelRank: parseInt(form.level.replace('L', ''), 10) });
        }
        refetch();
      } catch (e) { console.error(e); }
    } else if (editing) {
      const dept = mockDepartments.find((d) => d.id === form.departmentId);
      setData((prev) => prev.map((item) =>
        item.id === editing.id ? { ...item, name: form.name, code: form.code, description: form.description, departmentId: form.departmentId, departmentName: dept?.name, level: form.level, updatedAt: new Date().toISOString() } : item
      ));
    } else {
      const dept = mockDepartments.find((d) => d.id === form.departmentId);
      setData((prev) => [{
        id: String(Date.now()),
        name: form.name,
        code: form.code,
        description: form.description,
        level: form.level,
        departmentId: form.departmentId,
        departmentName: dept?.name,
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
          const { roleApi } = await import('src/services/api/role-api');
          await roleApi.remove(deleteId);
          refetch();
        } catch (e) { console.error(e); }
      } else {
        setData((prev) => prev.filter((item) => item.id !== deleteId));
      }
      setDeleteId(null);
    }
  }, [deleteId, refetch]);

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Role Name', flex: 1, minWidth: 180 },
    { field: 'departmentName', headerName: 'Department', width: 170 },
    { field: 'level', headerName: 'Hierarchy Level', width: 130 },
    {
      field: 'userCount', headerName: 'Assigned Users', width: 140,
      renderCell: (params) => {
        const count = getUserCount(params.row.id);
        return <Typography variant="body2">{count} {count === 1 ? 'user' : 'users'}</Typography>;
      },
    },
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
      <Helmet><title>Roles - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader title="Roles" description="Manage roles and hierarchy levels" action={
          <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={handleNew}>
            Create Role
          </Button>
        } />
        <Card sx={{ overflow: 'hidden' }}>
          <DataTable columns={columns} rows={data} getRowId={(r) => r.id} />
        </Card>
        {data.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Iconify icon="solar:user-id-bold" width={48} sx={{ color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">No Roles Created</Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
              Create your first role to start assigning permissions.
            </Typography>
            <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={handleNew}>
              Create Role
            </Button>
          </Box>
        )}
      </PageContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Role' : 'Create Role'}</DialogTitle>
        <Form methods={methods} onSubmit={methods.handleSubmit(onSubmit)}>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <Field.Select name="departmentId" label="Select Department" options={DEPT_OPTIONS} />
              <Field.Select name="level" label="Select Level" options={levelOptions} />
              <Field.Text name="name" label="Role Name" placeholder="e.g. Sales Manager" />
              <Field.Text name="code" label="Role Code" placeholder="e.g. SMGR" />
              <Field.Text name="description" label="Description" multiline rows={2} placeholder="Brief description of the role" />
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
