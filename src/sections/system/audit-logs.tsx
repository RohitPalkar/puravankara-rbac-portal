import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import dayjs from 'dayjs';
import { CONFIG } from 'src/config-global';
import { PageContainer, PageHeader } from 'src/components/page-layout';
import { Iconify } from 'src/components/iconify';
import { mockAuditLogs } from 'src/services/mock-data';
import type { AuditLog } from 'src/types';

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

  const actions = useMemo(() => {
    const set = new Set(mockAuditLogs.map((l) => l.action));
    return ['all', ...Array.from(set)];
  }, []);

  const entities = useMemo(() => {
    const set = new Set(mockAuditLogs.map((l) => l.entityType));
    return ['all', ...Array.from(set)];
  }, []);

  const filtered = useMemo(() => {
    let list = mockAuditLogs;
    if (actionFilter !== 'all') list = list.filter((l) => l.action === actionFilter);
    if (entityFilter !== 'all') list = list.filter((l) => l.entityType === entityFilter);
    if (search) {
      const lower = search.toLowerCase();
      list = list.filter(
        (l) =>
          l.entityLabel.toLowerCase().includes(lower) ||
          l.userName?.toLowerCase().includes(lower) ||
          l.details.toLowerCase().includes(lower)
      );
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [actionFilter, entityFilter, search]);

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
                  <TableCell sx={{ fontWeight: 700 }}>Details</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>IP Address</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {dayjs(log.createdAt).format('DD MMM YYYY, HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Chip label={log.action} size="small" color={ACTION_COLORS[log.action] ?? 'default'} variant="soft" />
                    </TableCell>
                    <TableCell>
                      <Stack>
                        <Typography variant="body2">{log.entityType}</Typography>
                        <Typography variant="caption" color="text.secondary">{log.entityLabel}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{log.details}</TableCell>
                    <TableCell>{log.userName}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>{log.ipAddress}</TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
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
