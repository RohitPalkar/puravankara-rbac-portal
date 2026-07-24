import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

import { z } from 'zod';
import dayjs from 'dayjs';
import { useForm } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { CONFIG } from 'src/config-global';
import { useRoleList, useCreateRole, useUpdateRole, useDeleteRole, useDepartmentList, useCreateDepartmentRole } from 'src/services/hooks/use-organization';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { EmptyState } from 'src/components/empty-state';
import { RowActionsMenu } from 'src/components/row-actions';
import { PageHeader, PageContainer } from 'src/components/page-layout';
import { DataTable, type FilterOption } from 'src/components/data-table';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const schema = z.object({
  name: z.string().min(1, 'Role Name is required'),
  departmentId: z.string().min(1, 'Department is required'),
  level: z.string().min(1, 'Level is required'),
  status: z.enum(['active', 'inactive']),
});

type FormData = z.infer<typeof schema>;
const defaults: FormData = { name: '', departmentId: '', level: '', status: 'active' };

export default function RoleListPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });
  const [search, setSearch] = useState('');

  const queryParams = useMemo(() => {
    const params: Record<string, unknown> = {
      page: paginationModel.page + 1,
      limit: paginationModel.pageSize,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    };
    if (search) params.search = search;
    return params;
  }, [search, paginationModel]);

  const { data: departments } = useDepartmentList();
  const { data: rolesData, isLoading, isError, error } = useRoleList(queryParams as any);
  const { mutateAsync: createRole } = useCreateRole();
  const { mutateAsync: updateRole } = useUpdateRole();
  const { mutateAsync: deleteRole, isPending: isDeleting } = useDeleteRole();
  const { mutateAsync: createDepartmentRole } = useCreateDepartmentRole();

  const roles = rolesData ?? [];
  const deptOptions = useMemo(
    () => (departments ?? []).map((d: any) => ({ value: String(d.id), label: d.name })),
    [departments],
  );

  const methods = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: defaults });
  const selectedDeptId = methods.watch('departmentId');

  const levelOptions = useMemo(() => {
    if (!selectedDeptId) return [];
    const dept = (departments ?? []).find((d: any) => String(d.id) === selectedDeptId);
    if (!dept) return [];
    const count = (dept as any).maxHierarchyLevels ?? (dept as any).levels ?? 1;
    return Array.from({ length: count }, (_, i) => ({ value: `L${i + 1}`, label: `L${i + 1}` }));
  }, [selectedDeptId, departments]);

  const handleNew = useCallback(() => {
    setEditing(null);
    methods.reset(defaults);
    setOpen(true);
  }, [methods]);

  const handleEdit = useCallback((row: any) => {
    setEditing(row);
    methods.reset({
      name: row.name,
      departmentId: String(row.departmentId ?? ''),
      level: row.hierarchyLevelRank ? `L${row.hierarchyLevelRank}` : '',
      status: row.isActive ? 'active' : 'inactive',
    });
    setOpen(true);
  }, [methods]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setEditing(null);
  }, []);

  const onSubmit = useCallback(async (form: FormData) => {
    try {
      const levelNumber = parseInt(form.level.replace('L', ''), 10);
      if (editing) {
        await updateRole({
          id: editing.id,
          data: {
            name: form.name,
            hierarchyLevelRank: levelNumber,
            isActive: form.status === 'active',
          },
        });
      } else {
        const created = await createRole({
          name: form.name,
          hierarchyLevelRank: levelNumber,
          isActive: form.status === 'active',
        });
        if (form.departmentId && created?.id) {
          await createDepartmentRole({
            departmentId: Number(form.departmentId),
            roleId: created.id,
          });
        }
      }
      handleClose();
    } catch (err: any) {
      console.error('Failed to save role:', err);
    }
  }, [editing, createRole, updateRole, createDepartmentRole, handleClose]);

  const handleDelete = useCallback(async () => {
    if (deleteId === null) return;
    try {
      await deleteRole(deleteId);
      setDeleteId(null);
    } catch {
      // handled by query cache invalidation
    }
  }, [deleteId, deleteRole]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, []);

  const filterOptions: FilterOption[] = [
    {
      key: 'isActive',
      label: 'Status',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ],
    },
  ];

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Role Name', flex: 1, minWidth: 150 },
    {
      field: 'hierarchyLevelRank',
      headerName: 'Level',
      width: 80,
      renderCell: (params) => <span>L{params.value}</span>,
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Label color={params.value ? 'success' : 'default'}>{params.value ? 'Active' : 'Inactive'}</Label>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created Date',
      width: 120,
      renderCell: (params) => dayjs(params.value).format('DD/MM/YYYY'),
    },
    {
      field: 'actions',
      headerName: '',
      width: 64,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params: any) => (
        <RowActionsMenu actions={[
          { label: 'Edit', icon: 'solar:pen-bold' as const, onClick: () => handleEdit(params.row) },
          { label: 'Delete', icon: 'solar:trash-bin-trash-bold' as const, onClick: () => setDeleteId(params.row.id), color: 'error.main' as const },
        ]} />
      ),
    },
  ];

  return (
    <>
      <Helmet><title>Roles - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader title="Roles" description="Manage roles and hierarchy levels" action={
          <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={handleNew}>
            Add Role
          </Button>
        } />
        <Card sx={{ overflow: 'hidden' }}>
          {isError ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Alert severity="error">Failed to load roles: {(error as Error)?.message || 'Unknown error'}</Alert>
            </Box>
          ) : !isLoading && roles.length === 0 && !search ? (
            <EmptyState
              icon="solar:user-id-bold-duotone"
              title="No Roles Created"
              description="Create your first role to get started"
            />
          ) : (
            <DataTable
              columns={columns}
              rows={roles}
              getRowId={(r) => r.id}
              loading={isLoading}
              paginationMode="server"
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              rowCount={roles.length}
              onSearchChange={handleSearchChange}
              searchValue={search}
              searchPlaceholder="Search roles by name..."
              filterOptions={filterOptions}
            />
          )}
        </Card>
      </PageContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Role' : 'Create Role'}</DialogTitle>
        <Form methods={methods} onSubmit={methods.handleSubmit(onSubmit)}>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <Field.Text name="name" label="Role Name" placeholder="e.g. Finance Executive" />
              <Field.Select name="departmentId" label="Department" options={deptOptions} />
              <Field.Select name="level" label="Level" options={levelOptions} />
              {editing && <Field.Select name="status" label="Status" options={STATUS_OPTIONS} />}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained">{editing ? 'Update' : 'Create'}</Button>
          </DialogActions>
        </Form>
      </Dialog>

      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)} maxWidth="xs">
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this role?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} color="inherit">Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
