import { NotificationService } from '../services/notification.service';
import { NotificationQueryDto } from '../dto/notification-query.dto';
import { UpdatePreferenceDto } from '../dto/notification-preference.dto';
export declare class NotificationController {
    private readonly notifService;
    constructor(notifService: NotificationService);
    findMy(req: any, query: NotificationQueryDto): Promise<{
        data: import("../entities/notification.entity").Notification[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    countUnread(req: any): Promise<{
        unreadCount: number;
    }>;
    getPreferences(req: any): Promise<import("../entities/notification-preference.entity").NotificationPreference>;
    updatePreferences(req: any, dto: UpdatePreferenceDto): Promise<import("../entities/notification-preference.entity").NotificationPreference>;
    markRead(id: string, req: any): Promise<import("../entities/notification.entity").Notification | {
        message: string;
    }>;
    markAllRead(req: any): Promise<{
        message: string;
    }>;
}
