import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';

import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { CONFIG } from 'src/config-global';
import { useAuditLogList } from 'src/services/hooks/use-audit';

import { Iconify } from 'src/components/iconify';
import { PageHeader, PageContainer } from 'src/components/page-layout';

const ACTION_COLORS: Record<string, 'info' | 'success' | 'error' | 'warning' | 'default'> = {
  CREATE: 'success',
  UPDATE: 'info',
  DELETE: 'error',
  LOGIN: 'default',
  APPROVE: 'success',
  REJECT: 'error',
};

export default function AuditLogsPage() {
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const { data: logs, isLoading } = useAuditLogList();

  const actions = useMemo(() => {
    if (!logs) return ['all'];
    const set = new Set(logs.map((l) => l.action));
    return ['all', ...Array.from(set)];
  }, [logs]);

  const entities = useMemo(() => {
    if (!logs) return ['all'];
    const set = new Set(logs.map((l) => l.entityName));
    return ['all', ...Array.from(set)];
  }, [logs]);

  const filtered = useMemo(() => {
    let list = logs ?? [];
    if (actionFilter !== 'all') list = list.filter((l) => l.action === actionFilter);
    if (entityFilter !== 'all') list = list.filter((l) => l.entityName === entityFilter);
    if (search) {
      const lower = search.toLowerCase();
      list = list.filter(
        (l) =>
          l.entityName?.toLowerCase().includes(lower) ||
          l.performerName?.toLowerCase().includes(lower) ||
          l.action?.toLowerCase().includes(lower)
      );
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [logs, actionFilter, entityFilter, search]);

  return (
    <>
      <Helmet><title>Audit Logs - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader title="Audit Logs" description="View system audit trail" />

        <Card sx={{ p: 2.5, mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <TextField
              label="Action"
              select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              sx={{ minWidth: 140 }}
            >
              {actions.map((a) => <MenuItem key={a} value={a}>{a === 'all' ? 'All Actions' : a}</MenuItem>)}
            </TextField>
            <TextField
              label="Entity"
              select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              sx={{ minWidth: 160 }}
            >
              {entities.map((e) => <MenuItem key={e} value={e}>{e === 'all' ? 'All Entities' : e}</MenuItem>)}
            </TextField>
            <TextField
              label="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search details, user, or entity..."
              sx={{ minWidth: 280 }}
              InputProps={{
                startAdornment: <Iconify icon="solar:magnifer-bold" width={18} style={{ marginRight: 8, opacity: 0.5 }} />,
              }}
            />
            <Typography variant="caption" color="text.secondary" ml="auto">
              {filtered.length} log{filtered.length !== 1 ? 's' : ''}
            </Typography>
          </Stack>
        </Card>

        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Timestamp</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Entity</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>IP Address</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : filtered.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {dayjs(log.createdAt).format('DD MMM YYYY, HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Chip label={log.action} size="small" color={ACTION_COLORS[log.action] ?? 'default'} variant="soft" />
                    </TableCell>
                    <TableCell>
                      <Stack>
                        <Typography variant="body2">{log.entityName}</Typography>
                        <Typography variant="caption" color="text.secondary">{log.entityId}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{log.performerName || log.performedBy}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>{log.ipAddress}</TableCell>
                  </TableRow>
                ))}
                {!isLoading && filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">No audit logs found.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </PageContainer>
    </>
  );
}