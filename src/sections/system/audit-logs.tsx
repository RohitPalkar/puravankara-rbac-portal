import type { GridColDef } from '@mui/x-data-grid';

import dayjs from 'dayjs';
import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';

import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { CONFIG } from 'src/config-global';
import { useAuditLogList } from 'src/services/hooks/use-audit';

import { PageHeader, PageContainer } from 'src/components/page-layout';
import { DataTable, type FilterOption } from 'src/components/data-table';

const ACTION_COLORS: Record<string, 'info' | 'success' | 'error' | 'warning' | 'default'> = {
  CREATE: 'success',
  UPDATE: 'info',
  DELETE: 'error',
  LOGIN: 'default',
  APPROVE: 'success',
  REJECT: 'error',
};

export default function AuditLogsPage() {
  const { data: logs, isLoading } = useAuditLogList();

  const sorted = useMemo(() => {
    if (!logs) return [];
    return [...logs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [logs]);

  const actionOptions = useMemo(() => {
    if (!logs) return [];
    const set = new Set(logs.map((l) => l.action));
    return Array.from(set).map((a) => ({ value: a, label: a }));
  }, [logs]);

  const entityOptions = useMemo(() => {
    if (!logs) return [];
    const set = new Set(logs.map((l) => l.entityName));
    return Array.from(set).map((e) => ({ value: e, label: e }));
  }, [logs]);

  const filterOptions: FilterOption[] = useMemo(
    () => [
      { key: 'action', label: 'Action', options: actionOptions },
      { key: 'entityName', label: 'Entity', options: entityOptions },
    ],
    [actionOptions, entityOptions]
  );

  const columns: GridColDef[] = [
    {
      field: 'createdAt',
      headerName: 'Timestamp',
      width: 180,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
          {dayjs(params.value).format('DD MMM YYYY, HH:mm')}
        </Typography>
      ),
    },
    {
      field: 'action',
      headerName: 'Action',
      width: 110,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={ACTION_COLORS[params.value] ?? 'default'}
          variant="soft"
        />
      ),
    },
    {
      field: 'entityName',
      headerName: 'Entity',
      minWidth: 180,
      flex: 1,
      renderCell: (params) => (
        <Stack>
          <Typography variant="body2">{params.value}</Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.entityId}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'performerName',
      headerName: 'User',
      minWidth: 150,
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2">{params.value || params.row.performedBy}</Typography>
      ),
    },
    {
      field: 'ipAddress',
      headerName: 'IP Address',
      width: 160,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>
          {params.value}
        </Typography>
      ),
    },
  ];

  return (
    <>
      <Helmet>
        <title>Audit Logs - {CONFIG.appName}</title>
      </Helmet>
      <PageContainer>
        <PageHeader title="Audit Logs" description="View system audit trail" />
        <DataTable
          columns={columns}
          rows={sorted}
          getRowId={(r) => r.id}
          loading={isLoading}
          searchPlaceholder="Search user, entity, or action..."
          filterOptions={filterOptions}
        />
      </PageContainer>
    </>
  );
}
