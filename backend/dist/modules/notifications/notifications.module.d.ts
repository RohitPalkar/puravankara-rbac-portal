import { OnModuleInit } from '@nestjs/common';
import { NotificationService } from './services/notification.service';
import { NotificationGateway } from './notification.gateway';
export declare class NotificationsModule implements OnModuleInit {
    private readonly notifService;
    private readonly notifGateway;
    constructor(notifService: NotificationService, notifGateway: NotificationGateway);
    onModuleInit(): void;
}
