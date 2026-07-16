import { UserZoneService } from '../services/user-zone.service';
import { UserZone } from '../entities/user-zone.entity';
declare class AssignZoneDto {
    userId: string;
    zoneId: number;
}
export declare class UserZoneController {
    private readonly zoneService;
    constructor(zoneService: UserZoneService);
    findByUser(userId: string): Promise<UserZone[]>;
    assign(dto: AssignZoneDto): Promise<UserZone>;
    revoke(userId: string, zoneId: number): Promise<{
        message: string;
    }>;
}
export {};
