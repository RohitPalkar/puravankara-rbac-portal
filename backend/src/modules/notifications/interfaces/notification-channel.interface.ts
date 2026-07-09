import { Notification } from '../entities/notification.entity';

export interface NotificationChannel {
  send(userId: string, notification: Notification): Promise<void>;
}
