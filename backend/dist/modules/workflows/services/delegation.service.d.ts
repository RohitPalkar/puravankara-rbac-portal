import { Repository } from 'typeorm';
import { UserDelegation } from '../../delegation/entities/user-delegation.entity';
import { UserRole } from '../../users/entities/user-role.entity';
import { User } from '../../users/entities/user.entity';
export declare class DelegationService {
    private readonly delegationRepo;
    private readonly userRoleRepo;
    private readonly userRepo;
    private readonly logger;
    constructor(delegationRepo: Repository<UserDelegation>, userRoleRepo: Repository<UserRole>, userRepo: Repository<User>);
    findEligibleApprovers(departmentId: number, roleId: number, levelRank: number, moduleId?: number): Promise<string[]>;
    private findActiveDelegate;
}
