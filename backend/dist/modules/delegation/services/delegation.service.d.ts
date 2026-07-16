import { Repository } from 'typeorm';
import { UserDelegation } from '../entities/user-delegation.entity';
import { User } from '../../users/entities/user.entity';
import { CreateDelegationDto } from '../dto/create-delegation.dto';
import { UpdateDelegationDto } from '../dto/update-delegation.dto';
import { DelegationQueryDto } from '../dto/delegation-query.dto';
import { NotificationService } from '../../notifications/services/notification.service';
export declare class DelegationService {
    private readonly delegationRepo;
    private readonly userRepo;
    private readonly notifService;
    private readonly logger;
    constructor(delegationRepo: Repository<UserDelegation>, userRepo: Repository<User>, notifService: NotificationService);
    findAll(query: DelegationQueryDto): Promise<{
        data: UserDelegation[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findById(id: number): Promise<UserDelegation>;
    create(dto: CreateDelegationDto): Promise<UserDelegation>;
    update(id: number, dto: UpdateDelegationDto): Promise<UserDelegation>;
    remove(id: number): Promise<void>;
}
