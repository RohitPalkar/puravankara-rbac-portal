import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { useAuditLogList } from 'src/services/hooks/use-audit';

import { Iconify } from 'src/components/iconify';

const ENTITY_CONFIG: Record<string, { label: string; icon: string; color: string; entityName: string }> = {
  users: { label: 'Recently Created Users', icon: 'solar:users-group-rounded-bold', color: '#2F3C98', entityName: 'User' },
  permissions: { label: 'Recently Updated Permissions', icon: 'solar:lock-bold', color: '#9C27B0', entityName: 'Permission' },
  departments: { label: 'Recent Departments', icon: 'solar:buildings-bold', color: '#00BCD4', entityName: 'Department' },
};

function ActivityCard({ type }: { type: string }) {
  const config = ENTITY_CONFIG[type];
  const { data: logs, isLoading } = useAuditLogList({
    entityName: config.entityName,
    limit: 5,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  });

  const entries = Array.isArray(logs) ? logs.slice(0, 5) : [];

  return (
    <Card variant="outlined" sx={{ borderRadius: 1.5, height: 1 }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
          <Box sx={{ width: 28, height: 28, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: `${config.color}14` }}>
            <Iconify icon={config.icon} width={16} sx={{ color: config.color }} />
          </Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{config.label}</Typography>
        </Stack>

        {isLoading ? (
          <Stack spacing={1}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height={40} sx={{ borderRadius: 1 }} />
            ))}
          </Stack>
        ) : entries.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Iconify icon="solar:clock-circle-bold" width={24} sx={{ color: 'text.disabled', mb: 1 }} />
            <Typography variant="caption" color="text.disabled">No recent activity</Typography>
          </Box>
        ) : (
          <Stack spacing={0.75}>
            {entries.map((log: any) => (
              <Stack key={log.id} direction="row" spacing={1.5} alignItems="center" sx={{ py: 0.5 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'success.main', flexShrink: 0 }} />
                <Stack sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontSize: '0.8125rem', fontWeight: 500 }} noWrap>
                    {log.action} — {log.entityName ?? '-'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {log.performedBy ?? 'System'}
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0 }}>
                  {dayjs(log.createdAt).fromNow()}
                </Typography>
              </Stack>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

export function RecentActivity() {
  return (
    <Stack spacing={2}>
      <ActivityCard type="users" />
      <ActivityCard type="permissions" />
      <ActivityCard type="departments" />
    </Stack>
  );
}
