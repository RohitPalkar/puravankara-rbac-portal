import { useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import type { GridColDef } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { CONFIG } from 'src/config-global';
import { PageContainer, PageHeader } from 'src/components/page-layout';
import { DataTable } from 'src/components/data-table';
import { Iconify } from 'src/components/iconify';
import { RowActionsMenu } from 'src/components/row-actions';
import { Label } from 'src/components/label';
import { useModuleActions } from './hooks/use-module-permission';

const MODULE_SAMPLE_DATA: Record<string, { id: number; name: string; code: string; status: string; date: string }[]> = {
  crm: [
    { id: 1, name: 'Acme Corp', code: 'CRM-001', status: 'Active', date: '2026-01-15' },
    { id: 2, name: 'Globex Inc', code: 'CRM-002', status: 'Active', date: '2026-02-20' },
    { id: 3, name: 'Initech', code: 'CRM-003', status: 'Inactive', date: '2026-03-10' },
  ],
  eoi: [
    { id: 1, name: 'Tower A - Unit 101', code: 'EOI-001', status: 'Pending', date: '2026-01-10' },
    { id: 2, name: 'Tower B - Unit 205', code: 'EOI-002', status: 'Approved', date: '2026-02-14' },
    { id: 3, name: 'Tower C - Unit 312', code: 'EOI-003', status: 'Rejected', date: '2026-03-22' },
  ],
  iom: [
    { id: 1, name: 'Loyalty IOM Batch 1', code: 'IOM-001', status: 'Active', date: '2026-01-05' },
    { id: 2, name: 'Stamp IOM Batch 2', code: 'IOM-002', status: 'Active', date: '2026-02-18' },
    { id: 3, name: 'Loyalty IOM Batch 3', code: 'IOM-003', status: 'Draft', date: '2026-03-30' },
  ],
  inventory: [
    { id: 1, name: 'Premium 2BHK - Tower A', code: 'INV-001', status: 'Available', date: '2026-01-01' },
    { id: 2, name: 'Standard 3BHK - Tower B', code: 'INV-002', status: 'Booked', date: '2026-02-10' },
    { id: 3, name: 'Luxury 4BHK - Tower C', code: 'INV-003', status: 'Blocked', date: '2026-03-15' },
  ],
  'booking-form': [
    { id: 1, name: 'BF-2026-001', code: 'BF-001', status: 'Draft', date: '2026-01-20' },
    { id: 2, name: 'BF-2026-002', code: 'BF-002', status: 'Submitted', date: '2026-02-25' },
    { id: 3, name: 'BF-2026-003', code: 'BF-003', status: 'Approved', date: '2026-03-05' },
  ],
  incentive: [
    { id: 1, name: 'Q1 Sales Incentive', code: 'INC-001', status: 'Active', date: '2026-01-01' },
    { id: 2, name: 'Referral Bonus', code: 'INC-002', status: 'Active', date: '2026-02-01' },
    { id: 3, name: 'Annual Performance', code: 'INC-003', status: 'Draft', date: '2026-03-01' },
  ],
};

const DEFAULT_DATA = [
  { id: 1, name: 'Sample Record 1', code: 'MOD-001', status: 'Active', date: '2026-01-01' },
  { id: 2, name: 'Sample Record 2', code: 'MOD-002', status: 'Pending', date: '2026-02-01' },
  { id: 3, name: 'Sample Record 3', code: 'MOD-003', status: 'Inactive', date: '2026-03-01' },
];

export default function ModuleListPage() {
  const navigate = useNavigate();
  const { moduleCode } = useParams<{ moduleCode: string }>();
  const { actions, moduleName, isLoading } = useModuleActions();

  const records = useMemo(() => {
    if (!moduleCode) return DEFAULT_DATA;
    return MODULE_SAMPLE_DATA[moduleCode] ?? DEFAULT_DATA;
  }, [moduleCode]);

  const handleView = useCallback(
    (row: (typeof records)[0]) => {
      navigate(`/dashboard/modules/${moduleCode}/${row.id}`);
    },
    [navigate, moduleCode],
  );

  const handleEdit = useCallback(
    (row: (typeof records)[0]) => {
      navigate(`/dashboard/modules/${moduleCode}/${row.id}/edit`);
    },
    [navigate, moduleCode],
  );

  const handleDelete = useCallback(
    (row: (typeof records)[0]) => {
      navigate(`/dashboard/modules/${moduleCode}/${row.id}/delete`);
    },
    [navigate, moduleCode],
  );

  const columns: GridColDef[] = useMemo(
    () => [
      { field: 'name', headerName: 'Name', flex: 1 },
      { field: 'code', headerName: 'Code', width: 120 },
      {
        field: 'status', headerName: 'Status', width: 120,
        renderCell: (params) => (
          <Label color={params.value === 'Active' || params.value === 'Approved' || params.value === 'Available' ? 'success' : params.value === 'Pending' || params.value === 'Draft' ? 'warning' : 'default'}>
            {params.value as string}
          </Label>
        ),
      },
      { field: 'date', headerName: 'Date', width: 130 },
      {
        field: 'actions', headerName: '', width: 60, sortable: false, disableColumnMenu: true,
        renderCell: (params) => (
          <Stack alignItems="center" sx={{ height: 1, justifyContent: 'center' }}>
            <RowActionsMenu actions={[
              ...(actions.VIEW ? [{ label: 'View', icon: 'solar:eye-bold' as const, onClick: () => handleView(params.row as (typeof records)[0]) }] : []),
              ...(actions.EDIT ? [{ label: 'Edit', icon: 'solar:pen-bold' as const, onClick: () => handleEdit(params.row as (typeof records)[0]) }] : []),
              ...(actions.DELETE ? [{ label: 'Delete', icon: 'solar:trash-bin-trash-bold' as const, onClick: () => handleDelete(params.row as (typeof records)[0]) }] : []),
            ]} />
          </Stack>
        ),
      },
    ],
    [actions, handleView, handleEdit, handleDelete],
  );

  if (isLoading) {
    return (
      <PageContainer>
        <CircularProgress />
      </PageContainer>
    );
  }

  if (!actions.VIEW) {
    return (
      <PageContainer>
        <Typography color="error">You do not have permission to view this module.</Typography>
      </PageContainer>
    );
  }

  return (
    <>
      <Helmet><title>{moduleName || 'Module'} Records - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader
          title={`${moduleName || 'Module'} Records`}
          description={`Manage ${moduleName?.toLowerCase() || 'module'} records.`}
          action={
            actions.CREATE && (
              <Button
                variant="contained"
                startIcon={<Iconify icon="solar:add-circle-bold" />}
                onClick={() => navigate(`/dashboard/modules/${moduleCode}/new`)}
              >
                Create New
              </Button>
            )
          }
        />
        <DataTable
          rows={records}
          columns={columns}
        />
      </PageContainer>
    </>
  );
}
