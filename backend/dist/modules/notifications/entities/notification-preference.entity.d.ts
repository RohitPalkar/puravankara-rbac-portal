import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { User } from '../../users/entities/user.entity';
export declare class NotificationPreference extends AppBaseEntity {
    userId: string;
    user: User;
    emailEnabled: boolean;
    inAppEnabled: boolean;
    pushEnabled: boolean;
}
