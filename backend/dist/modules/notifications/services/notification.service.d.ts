import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { NotificationPreference } from '../entities/notification-preference.entity';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { NotificationQueryDto } from '../dto/notification-query.dto';
import { NotificationChannel } from '../interfaces/notification-channel.interface';
import { AuditService } from '../../audit/services/audit.service';
export declare class NotificationService {
    private readonly notifRepo;
    private readonly prefRepo;
    private readonly auditService;
    private readonly logger;
    private channels;
    private onNotification;
    constructor(notifRepo: Repository<Notification>, prefRepo: Repository<NotificationPreference>, auditService: AuditService);
    setOnNotification(cb: (notification: Notification) => void): void;
    addChannel(channel: NotificationChannel): void;
    create(dto: CreateNotificationDto): Promise<Notification>;
    sendToUser(userId: string, title: string, message?: string, referenceType?: string, referenceId?: string, notificationType?: string, priority?: string, metadata?: Record<string, any>): Promise<Notification>;
    sendToUsers(userIds: string[], title: string, message?: string, referenceType?: string, referenceId?: string): Promise<Notification[]>;
    findMyNotifications(userId: string, query: NotificationQueryDto): Promise<{
        data: Notification[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    markAsRead(notificationId: number, userId: string): Promise<Notification | null>;
    markAllAsRead(userId: string): Promise<void>;
    getUnreadCount(userId: string): Promise<number>;
    getPreferences(userId: string): Promise<NotificationPreference | null>;
    updatePreferences(userId: string, updates: Partial<NotificationPreference>): Promise<NotificationPreference>;
}
