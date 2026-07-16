import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { NotificationPreference } from '../entities/notification-preference.entity';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { NotificationQueryDto } from '../dto/notification-query.dto';
import { NotificationChannel } from '../interfaces/notification-channel.interface';
import { AuditService } from '../../audit/services/audit.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private channels: NotificationChannel[] = [];
  private onNotification: ((notification: Notification) => void) | null = null;

  constructor(
    @InjectRepository(Notification)
    private readonly notifRepo: Repository<Notification>,
    @InjectRepository(NotificationPreference)
    private readonly prefRepo: Repository<NotificationPreference>,
    private readonly auditService: AuditService,
  ) {}

  setOnNotification(cb: (notification: Notification) => void): void {
    this.onNotification = cb;
  }

  addChannel(channel: NotificationChannel): void {
    this.channels.push(channel);
  }

  async create(dto: CreateNotificationDto): Promise<Notification> {
    const notif = this.notifRepo.create({
      userId: dto.userId,
      title: dto.title,
      message: dto.message,
      notificationType: dto.notificationType,
      priority: dto.priority || 'NORMAL',
      referenceType: dto.referenceType,
      referenceId: dto.referenceId,
      metadata: dto.metadata || null,
      isRead: false,
    });
    const saved = await this.notifRepo.save(notif);

    this.auditService
      .createLog({
        entityName: 'NOTIFICATION',
        action: 'CREATED',
        entityId: String(saved.id),
        newValue: { userId: dto.userId, type: dto.notificationType },
        performedBy: dto.userId,
        source: 'NOTIFICATION',
      })
      .catch(() => {});

    this.onNotification?.(saved);

    const pref = await this.prefRepo.findOne({ where: { userId: dto.userId } });
    if (!pref || pref.inAppEnabled) {
      for (const channel of this.channels) {
        channel
          .send(dto.userId, saved)
          .catch((err) =>
            this.logger.error(`Channel send failed: ${err.message}`),
          );
      }
    }

    return saved;
  }

  async sendToUser(
    userId: string,
    title: string,
    message?: string,
    referenceType?: string,
    referenceId?: string,
    notificationType?: string,
    priority?: string,
    metadata?: Record<string, any>,
  ): Promise<Notification> {
    return this.create({
      userId,
      title,
      message,
      notificationType,
      priority,
      referenceType,
      referenceId,
      metadata,
    });
  }

  async sendToUsers(
    userIds: string[],
    title: string,
    message?: string,
    referenceType?: string,
    referenceId?: string,
  ): Promise<Notification[]> {
    return Promise.all(
      userIds.map((uid) =>
        this.sendToUser(uid, title, message, referenceType, referenceId),
      ),
    );
  }

  async findMyNotifications(userId: string, query: NotificationQueryDto) {
    const { unreadOnly, type, priority, page = 1, limit = 20 } = query;

    const where: any = { userId };
    if (unreadOnly) where.isRead = false;
    if (type) where.notificationType = type;
    if (priority) where.priority = priority;

    const [data, total] = await this.notifRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async markAsRead(
    notificationId: number,
    userId: string,
  ): Promise<Notification | null> {
    const notif = await this.notifRepo.findOne({
      where: { id: notificationId, userId },
    });
    if (!notif) return null;

    notif.isRead = true;
    notif.readAt = new Date();
    const saved = await this.notifRepo.save(notif);

    this.auditService
      .createLog({
        entityName: 'NOTIFICATION',
        action: 'READ',
        entityId: String(saved.id),
        performedBy: userId,
        source: 'NOTIFICATION',
      })
      .catch(() => {});

    return saved;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notifRepo.update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );

    this.auditService
      .createLog({
        entityName: 'NOTIFICATION',
        action: 'READ_ALL',
        entityId: userId,
        performedBy: userId,
        source: 'NOTIFICATION',
      })
      .catch(() => {});
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notifRepo.count({ where: { userId, isRead: false } });
  }

  async getPreferences(userId: string): Promise<NotificationPreference | null> {
    let pref = await this.prefRepo.findOne({ where: { userId } });
    if (!pref) {
      pref = this.prefRepo.create({ userId });
      pref = await this.prefRepo.save(pref);
    }
    return pref;
  }

  async updatePreferences(
    userId: string,
    updates: Partial<NotificationPreference>,
  ): Promise<NotificationPreference> {
    let pref = await this.prefRepo.findOne({ where: { userId } });
    if (!pref) {
      pref = this.prefRepo.create({ userId });
    }
    Object.assign(pref, updates);
    const saved = await this.prefRepo.save(pref);

    this.auditService
      .createLog({
        entityName: 'NOTIFICATION_PREFERENCE',
        action: 'UPDATED',
        entityId: userId,
        newValue: updates,
        performedBy: userId,
        source: 'NOTIFICATION',
      })
      .catch(() => {});

    return saved;
  }
}
