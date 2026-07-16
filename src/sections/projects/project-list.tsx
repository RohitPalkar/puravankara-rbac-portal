import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import type { GridColDef } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import { CONFIG } from 'src/config-global';
import { DataTable } from 'src/components/data-table';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { PageContainer, PageHeader } from 'src/components/page-layout';
import { RowActionsMenu } from 'src/components/row-actions';
import { StatusBadge } from 'src/components/status-badge';
import { mockProjects } from 'src/services/mock-data';
import { paths } from 'src/routes/paths';
import type { Project } from 'src/types';

export default function ProjectListPage() {
  const navigate = useNavigate();

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Project Name', flex: 1 },
    { field: 'brandName', headerName: 'Brand', width: 140 },
    { field: 'cityName', headerName: 'City', width: 130 },
    {
      field: 'incentiveRules', headerName: 'RERA Reg.', width: 110,
      valueGetter: (_value: any, row: Project) => {
        const rera = row.incentiveRules?.find((r) => r.incentiveType === 'rera');
        return rera?.regularizationPercentage != null ? `${rera.regularizationPercentage}%` : '-';
      },
    },
    {
      field: 'reraPayable', headerName: 'RERA Payable', width: 110,
      valueGetter: (_value: any, row: Project) => {
        const rera = row.incentiveRules?.find((r) => r.incentiveType === 'rera');
        return rera?.payablePercentage != null ? `${rera.payablePercentage}%` : '-';
      },
    },
    {
      field: 'rtmReg', headerName: 'RTM Reg.', width: 100,
      valueGetter: (_value: any, row: Project) => {
        const rtm = row.incentiveRules?.find((r) => r.incentiveType === 'rtm');
        return rtm?.regularizationPercentage != null ? `${rtm.regularizationPercentage}%` : '-';
      },
    },
    {
      field: 'rtmPayable', headerName: 'RTM Payable', width: 110,
      valueGetter: (_value: any, row: Project) => {
        const rtm = row.incentiveRules?.find((r) => r.incentiveType === 'rtm');
        return rtm?.payablePercentage != null ? `${rtm.payablePercentage}%` : '-';
      },
    },
    {
      field: 'status', headerName: 'Status', width: 100,
      renderCell: (params) => <StatusBadge status={params.value as 'active' | 'inactive'} />,
    },
    {
      field: 'actions', headerName: '', width: 60, sortable: false, disableColumnMenu: true,
      renderCell: (params) => (
        <Stack alignItems="center" sx={{ height: 1, justifyContent: 'center' }}>
          <RowActionsMenu actions={[
            { label: 'Edit', icon: 'solar:pen-bold', onClick: () => navigate(paths.dashboard.projectMasterEdit(params.row.id)) },
          ]} />
        </Stack>
      ),
    },
  ];

  return (
    <>
      <Helmet><title>Projects - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader title="Projects" description="Manage project master data" action={
          <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={() => navigate(paths.dashboard.projectMasterCreate)}>
            Add Project
          </Button>
        } />
        <Card sx={{ overflow: 'hidden' }}>
          <DataTable columns={columns} rows={mockProjects} getRowId={(r) => r.id} />
        </Card>
      </PageContainer>
    </>
  );
}
