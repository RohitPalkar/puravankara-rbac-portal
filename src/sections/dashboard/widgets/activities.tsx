import dayjs from 'dayjs';
import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { Iconify } from 'src/components/iconify';

const ACTION_ICONS: Record<string, string> = {
  CREATE: 'solar:add-circle-bold',
  VIEW: 'solar:eye-bold',
  EDIT: 'solar:pen-bold',
  DELETE: 'solar:trash-bin-trash-bold',
  APPROVE: 'solar:check-circle-bold',
  LOGIN_SUCCESS: 'solar:login-2-bold',
  LOGIN_FAILED: 'solar:close-circle-bold',
  ACCOUNT_LOCKED: 'solar:lock-keyhole-bold',
};

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'success.main',
  DELETE: 'error.main',
  APPROVE: 'success.main',
  LOGIN_FAILED: 'error.main',
  ACCOUNT_LOCKED: 'warning.main',
};

interface Props {
  auditLogs: any;
  auditLoading: boolean;
}

export function RecentActivities({ auditLogs, auditLoading }: Props) {
  const [showAll, setShowAll] = useState(false);

  const entries = useMemo(() => {
    if (!auditLogs) return [];
    const logs = Array.isArray(auditLogs) ? auditLogs : (auditLogs as any).data ?? [];
    return showAll ? logs : logs.slice(0, 5);
  }, [auditLogs, showAll]);

  if (auditLoading) {
    return (
      <Card variant="outlined" sx={{ borderRadius: 1.5, height: 1 }}>
        <CardContent><Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} /></CardContent>
      </Card>
    );
  }

  if (entries.length === 0) return null;

  return (
    <Card variant="outlined" sx={{ borderRadius: 1.5, height: 1 }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
          <Box sx={{ width: 28, height: 28, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'primary.lighter' }}>
            <Iconify icon="solar:clock-circle-bold" width={16} color="primary.main" />
          </Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Recent Activities</Typography>
            <Button size="small" variant="text" sx={{ fontSize: '0.75rem', p: 0, minWidth: 0 }} onClick={() => setShowAll(!showAll)}>
              {showAll ? 'Show Less' : 'View All →'}
            </Button>
          </Stack>
        </Stack>
        <Stack spacing={0.5}>
          {entries.map((log: any) => {
            const icon = ACTION_ICONS[log.action as string] ?? 'solar:info-circle-bold';
            const color = ACTION_COLORS[log.action as string] ?? 'text.secondary';
            return (
              <Stack key={log.id} direction="row" spacing={1.5} alignItems="center" sx={{ py: 0.5 }}>
                <Iconify icon={icon} width={16} sx={{ color, flexShrink: 0 }} />
                <Stack sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontSize: '0.8125rem', fontWeight: 500 }} noWrap>
                    {log.entityName ?? log.entityType ?? '-'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {log.action} — {log.performedBy ?? 'System'}
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0 }}>
                  {dayjs(log.createdAt).fromNow()}
                </Typography>
              </Stack>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}

export function AuditTimeline({ auditLogs, auditLoading }: Props) {
  const entries = useMemo(() => {
    if (!auditLogs) return [];
    const logs = Array.isArray(auditLogs) ? auditLogs : (auditLogs as any).data ?? [];
    return logs.slice(0, 5);
  }, [auditLogs]);

  if (auditLoading) {
    return (
      <Card variant="outlined" sx={{ borderRadius: 1.5 }}>
        <CardContent><Skeleton variant="rectangular" height={160} sx={{ borderRadius: 1 }} /></CardContent>
      </Card>
    );
  }

  if (entries.length === 0) return null;

  return (
    <Card variant="outlined" sx={{ borderRadius: 1.5 }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
          <Box sx={{ width: 28, height: 28, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'info.lighter' }}>
            <Iconify icon="solar:clipboard-list-bold" width={16} color="info.main" />
          </Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Audit Timeline</Typography>
            <Button size="small" variant="text" sx={{ fontSize: '0.75rem', p: 0, minWidth: 0 }}>
              View All →
            </Button>
          </Stack>
        </Stack>
        <Stack spacing={1}>
          {entries.map((log: any) => {
            const isSuccess = log.action !== 'LOGIN_FAILED' && log.action !== 'ACCOUNT_LOCKED' && log.action !== 'DELETE';
            return (
              <Stack key={log.id} direction="row" spacing={1.5} alignItems="flex-start">
                <Stack spacing={0.5} alignItems="center" sx={{ pt: 0.25 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: isSuccess ? 'success.main' : 'warning.main', flexShrink: 0 }} />
                  <Box sx={{ width: 1, flex: 1, minHeight: 20, borderLeft: '1px dashed', borderColor: 'divider' }} />
                </Stack>
                <Stack spacing={0.25} sx={{ flex: 1, pb: 1 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>
                      {log.entityName ?? log.entityType ?? '-'}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {dayjs(log.createdAt).format('HH:mm')}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {log.action} by {log.performedBy ?? 'System'}
                  </Typography>
                </Stack>
              </Stack>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}
