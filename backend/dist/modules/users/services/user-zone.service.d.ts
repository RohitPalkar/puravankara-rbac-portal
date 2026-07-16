import { Repository } from 'typeorm';
import { UserZone } from '../entities/user-zone.entity';
export declare class UserZoneService {
    readonly repository: Repository<UserZone>;
    constructor(repository: Repository<UserZone>);
    findByUser(userId: string): Promise<UserZone[]>;
    assign(userId: string, zoneId: number): Promise<UserZone>;
    revoke(userId: string, zoneId: number): Promise<void>;
    revokeAll(userId: string): Promise<void>;
}
