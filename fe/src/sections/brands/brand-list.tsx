import type { Brand } from 'src/types';

import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { useBrands } from 'src/services/api-adapters';

import { Iconify } from 'src/components/iconify';
import { PageHeader, PageContainer } from 'src/components/page-layout';
import { GroupedHeaderTable } from 'src/components/tables';
import type { TableColumn } from 'src/components/tables';

export default function BrandListPage() {
  const navigate = useNavigate();
  const { data: apiData, loading } = useBrands();
  const [data, setData] = useState<Brand[]>([]);
  useEffect(() => { setData(apiData); }, [apiData]);

  const columns: TableColumn[] = [
    { field: 'brandName', title: 'Brand Name', width: 180, sortable: true },
    {
      field: 'salaryMultiplier',
      title: 'Salary Multiplier',
      width: 150,
      sortable: true,
      align: 'right',
      renderCell: (row: Brand) => (
        <Typography variant="body2">{row.salaryMultiplier}x</Typography>
      ),
    },
    {
      group: 'RERA',
      children: [
        {
          field: 'reraRegularizationPercentage',
          title: 'Regularization %',
          width: 140,
          sortable: true,
          align: 'right',
          renderCell: (row: Brand) => (
            <Typography variant="body2">{row.reraRegularizationPercentage ?? '—'}%</Typography>
          ),
        },
        {
          field: 'reraQualificationPercentage',
          title: 'Qualification %',
          width: 140,
          sortable: true,
          align: 'right',
          renderCell: (row: Brand) => (
            <Typography variant="body2">{row.reraQualificationPercentage ?? '—'}%</Typography>
          ),
        },
      ],
    },
    {
      group: 'RTM / OC',
      children: [
        {
          field: 'rtmRegularizationPercentage',
          title: 'Regularization %',
          width: 140,
          sortable: true,
          align: 'right',
          renderCell: (row: Brand) => (
            <Typography variant="body2">{row.rtmRegularizationPercentage ?? '—'}%</Typography>
          ),
        },
        {
          field: 'rtmQualificationPercentage',
          title: 'Qualification %',
          width: 140,
          sortable: true,
          align: 'right',
          renderCell: (row: Brand) => (
            <Typography variant="body2">{row.rtmQualificationPercentage ?? '—'}%</Typography>
          ),
        },
      ],
    },
    {
      field: 'actions',
      title: '',
      width: 60,
      sortable: false,
      renderCell: (row: Brand) => (
        <Stack alignItems="center" sx={{ height: 1, justifyContent: 'center' }}>
          <IconButton
            size="small"
            onClick={() => navigate(paths.dashboard.brandEdit(row.id))}
          >
            <Iconify icon="solar:pen-bold" width={18} />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <>
      <Helmet><title>Brands - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader
          title="Brands"
          description="Manage brand configurations, payment gateways, and incentive criteria"
        />
        <GroupedHeaderTable
          columns={columns}
          rows={data}
          getRowId={(r) => r.id}
          loading={loading}
          searchPlaceholder="Search by brand name..."
          searchFields={['brandName']}
          defaultSortField="brandName"
        />
      </PageContainer>
    </>
  );
}