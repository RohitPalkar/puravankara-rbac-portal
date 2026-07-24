import type { GridColDef } from '@mui/x-data-grid';

import { Helmet } from 'react-helmet-async';

import Card from '@mui/material/Card';

import { CONFIG } from 'src/config-global';
import { useChannelPartnerTypeList } from 'src/services/hooks';

import { Label } from 'src/components/label';
import { DataTable } from 'src/components/data-table';
import { PageHeader, PageContainer } from 'src/components/page-layout';

export default function ChannelPartnerTypeListPage() {
  const { data, isLoading } = useChannelPartnerTypeList();

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 60 },
    { field: 'name', headerName: 'Type Name', flex: 1, minWidth: 160 },
    { field: 'description', headerName: 'Description', flex: 2, minWidth: 250 },
    {
      field: 'status', headerName: 'Status', width: 100,
      renderCell: (params) => (
        <Label color={params.value === 'active' ? 'success' : 'default'}>{params.value}</Label>
      ),
    },
  ];

  return (
    <>
      <Helmet><title>CP Types - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader title="Channel Partner Types" description="Manage partner categories" />
        <Card sx={{ overflow: 'hidden' }}>
          <DataTable columns={columns} rows={data ?? []} getRowId={(r) => r.id} loading={isLoading} />
        </Card>
      </PageContainer>
    </>
  );
}
