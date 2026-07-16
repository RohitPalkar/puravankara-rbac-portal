import { User } from './user.entity';
import { Zone } from '../../geography/entities/zone.entity';
export declare class UserZone {
    userId: string;
    zoneId: number;
    user: User;
    zone: Zone;
    createdAt: Date;
}
