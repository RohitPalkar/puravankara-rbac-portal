import { endpoints } from '../api/endpoints';
import { apiGet, apiPatch } from '../api/client';

import type { ApiResponse } from '../types/api';
import type {
  Notification,
  NotificationQuery,
  NotificationPreference,
  UpdateNotificationPreferenceRequest,
} from '../types/notification';

export const notificationService = {
  list: async (params?: NotificationQuery): Promise<ApiResponse<Notification[]>> =>
    apiGet<Notification[]>(endpoints.notifications.list, params as Record<string, unknown>),

  unreadCount: async (): Promise<ApiResponse<{ count: number }>> =>
    apiGet<{ count: number }>(endpoints.notifications.count),

  preferences: {
    get: async (): Promise<ApiResponse<NotificationPreference>> =>
      apiGet<NotificationPreference>(endpoints.notifications.preferences.get),

    update: async (
      data: UpdateNotificationPreferenceRequest
    ): Promise<ApiResponse<NotificationPreference>> =>
      apiPatch<NotificationPreference>(endpoints.notifications.preferences.update, data),
  },

  markRead: async (id: number): Promise<ApiResponse<void>> =>
    apiPatch<void>(endpoints.notifications.read(id)),

  markAllRead: async (): Promise<ApiResponse<void>> =>
    apiPatch<void>(endpoints.notifications.readAll),
};
