import type { Notification, NotificationType } from 'src/types';

import dayjs from 'dayjs';
import { Helmet } from 'react-helmet-async';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Skeleton from '@mui/material/Skeleton';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { CONFIG } from 'src/config-global';
import { useNotificationList } from 'src/services/hooks';

import { Iconify } from 'src/components/iconify';
import { PageHeader, PageContainer } from 'src/components/page-layout';

dayjs.extend(relativeTime);

const TYPE_CONFIG: Record<NotificationType, { color: 'info' | 'warning' | 'success' | 'error'; icon: string }> = {
  info: { color: 'info', icon: 'solar:info-circle-bold' },
  warning: { color: 'warning', icon: 'solar:danger-triangle-bold' },
  success: { color: 'success', icon: 'solar:check-circle-bold' },
  error: { color: 'error', icon: 'solar:close-circle-bold' },
};

export default function NotificationsPage() {
  const { data: notificationsData, isLoading } = useNotificationList();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (notificationsData) {
      setNotifications(notificationsData as unknown as Notification[]);
    }
  }, [notificationsData]);

  const filtered = useMemo(() => {
    let list = notifications;
    if (filter === 'unread') list = list.filter((n) => !n.isRead);
    if (filter === 'read') list = list.filter((n) => n.isRead);
    if (search) {
      const lower = search.toLowerCase();
      list = list.filter((n) => n.title.toLowerCase().includes(lower) || n.message.toLowerCase().includes(lower));
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notifications, filter, search]);

  const handleToggleRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  }, []);

  const handleMarkAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);

  return (
    <>
      <Helmet><title>Notifications - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader
          title="Notifications"
          description="View system notifications"
          action={
            unreadCount > 0 ? (
              <Tooltip title="Mark all as read">
                <IconButton onClick={handleMarkAllRead}>
                  <Iconify icon="solar:double-alt-arrow-down-bold" width={20} />
                </IconButton>
              </Tooltip>
            ) : undefined
          }
        />

        <Card sx={{ p: 2.5, mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <ToggleButtonGroup
              value={filter}
              exclusive
              onChange={(_, v) => { if (v) setFilter(v); }}
              size="small"
            >
              <ToggleButton value="all">All</ToggleButton>
              <ToggleButton value="unread">Unread ({unreadCount})</ToggleButton>
              <ToggleButton value="read">Read</ToggleButton>
            </ToggleButtonGroup>
            <TextField
              label="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notifications..."
              sx={{ minWidth: 280 }}
              InputProps={{
                startAdornment: <Iconify icon="solar:magnifer-bold" width={18} style={{ marginRight: 8, opacity: 0.5 }} />,
              }}
            />
          </Stack>
        </Card>

        <Card>
          {isLoading ? (
            <Box sx={{ p: 4 }}>
              <Skeleton variant="rectangular" height={52} sx={{ borderRadius: 1, mb: 1 }} />
              <Skeleton variant="rectangular" height={52} sx={{ borderRadius: 1, mb: 1 }} />
              <Skeleton variant="rectangular" height={52} sx={{ borderRadius: 1 }} />
            </Box>
          ) : (
            <List disablePadding>
              {filtered.map((notif, idx) => {
                const typeCfg = TYPE_CONFIG[notif.type];
                return (
                  <ListItem
                    key={notif.id}
                    divider={idx < filtered.length - 1}
                    sx={{
                      px: 3, py: 2,
                      bgcolor: !notif.isRead ? 'action.hover' : 'transparent',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.selected' },
                    }}
                    secondaryAction={
                      <Tooltip title={notif.isRead ? 'Mark as unread' : 'Mark as read'}>
                        <IconButton edge="end" size="small" onClick={(e) => { e.stopPropagation(); handleToggleRead(notif.id); }}>
                          <Iconify
                            icon={notif.isRead ? 'solar:inbox-archive-bold' : 'solar:inbox-unread-bold'}
                            width={18}
                            color={notif.isRead ? 'text.disabled' : 'primary.main'}
                          />
                        </IconButton>
                      </Tooltip>
                    }
                  >
                    <Box sx={{ mr: 1.5, mt: 0.3 }}>
                      <Iconify icon={typeCfg.icon} width={22} color={`${typeCfg.color}.main`} />
                    </Box>
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2" fontWeight={notif.isRead ? 400 : 700}>{notif.title}</Typography>
                          {!notif.isRead && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0 }} />}
                        </Stack>
                      }
                      secondary={
                        <Stack>
                          <Typography variant="body2" color="text.secondary">{notif.message}</Typography>
                          <Typography variant="caption" color="text.disabled">{dayjs(notif.createdAt).fromNow()}</Typography>
                        </Stack>
                      }
                    />
                    <Chip label={notif.type} size="small" color={typeCfg.color} variant="soft" sx={{ ml: 2, height: 20, fontSize: 11 }} />
                  </ListItem>
                );
              })}
              {filtered.length === 0 && (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Iconify icon="solar:inbox-archive-bold" width={48} style={{ opacity: 0.3, marginBottom: 12 }} />
                  <Typography variant="body1" color="text.secondary">No notifications</Typography>
                </Box>
              )}
            </List>
          )}
        </Card>
      </PageContainer>
    </>
  );
}
