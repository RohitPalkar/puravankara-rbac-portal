import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '../api/query-keys';
import { notificationService } from '../services/notification.service';
import type { NotificationQuery, UpdateNotificationPreferenceRequest } from '../types/notification';

export function useNotificationList(params?: NotificationQuery) {
  return useQuery({
    queryKey: queryKeys.notifications.list(params as Record<string, unknown>),
    queryFn: async () => {
      const res = await notificationService.list(params);
      return res.data;
    },
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: queryKeys.notifications.count,
    queryFn: async () => {
      const res = await notificationService.unreadCount();
      return res.data;
    },
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: queryKeys.notifications.preferences,
    queryFn: async () => {
      const res = await notificationService.preferences.get();
      return res.data;
    },
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateNotificationPreferenceRequest) => {
      const res = await notificationService.preferences.update(data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.preferences });
    },
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await notificationService.markRead(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await notificationService.markAllRead();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}
