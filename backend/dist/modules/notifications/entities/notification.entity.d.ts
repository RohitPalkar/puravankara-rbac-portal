import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { User } from '../../users/entities/user.entity';
export declare class Notification extends AppBaseEntity {
    userId: string;
    user: User;
    title: string;
    message: string;
    notificationType: string;
    priority: string;
    referenceType: string;
    referenceId: string;
    metadata: Record<string, any>;
    isRead: boolean;
    readAt: Date;
}
