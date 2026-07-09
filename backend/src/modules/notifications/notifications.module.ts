import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationPreference } from './entities/notification-preference.entity';
import { NotificationService } from './services/notification.service';
import { NotificationController } from './controllers/notification.controller';
import { NotificationGateway } from './notification.gateway';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, NotificationPreference]),
    AuditModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationGateway],
  exports: [NotificationService, TypeOrmModule],
})
export class NotificationsModule implements OnModuleInit {
  constructor(
    private readonly notifService: NotificationService,
    private readonly notifGateway: NotificationGateway,
  ) {}

  onModuleInit(): void {
    this.notifService.setOnNotification((notification) => {
      this.notifGateway.sendToUser(
        notification.userId,
        'notification.created',
        notification,
      );
      this.notifGateway.sendToUser(
        notification.userId,
        'notification.unread_count',
        { unreadCount: 1 },
      );
    });
  }
}
