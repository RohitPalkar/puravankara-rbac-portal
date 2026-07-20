import { AppBase } from './common';

export interface Notification extends AppBase {
  userId: string;
  title: string;
  message?: string;
  notificationType?: string;
  priority: string;
  referenceType?: string;
  referenceId?: string;
  metadata?: Record<string, unknown>;
  isRead: boolean;
  readAt?: string;
}

export interface NotificationPreference extends AppBase {
  userId: string;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  pushEnabled: boolean;
}

export interface UpdateNotificationPreferenceRequest {
  inAppEnabled?: boolean;
  emailEnabled?: boolean;
  pushEnabled?: boolean;
}

export interface NotificationQuery {
  unreadOnly?: boolean;
  type?: string;
  priority?: string;
  page?: number;
  limit?: number;
}
