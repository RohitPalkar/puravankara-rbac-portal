import { DelegationService } from '../services/delegation.service';
import { CreateDelegationDto } from '../dto/create-delegation.dto';
import { UpdateDelegationDto } from '../dto/update-delegation.dto';
import { DelegationQueryDto } from '../dto/delegation-query.dto';
export declare class DelegationController {
    private readonly delegationService;
    constructor(delegationService: DelegationService);
    findAll(query: DelegationQueryDto): Promise<{
        data: import("../entities/user-delegation.entity").UserDelegation[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findById(id: number): Promise<import("../entities/user-delegation.entity").UserDelegation>;
    create(dto: CreateDelegationDto): Promise<import("../entities/user-delegation.entity").UserDelegation>;
    update(id: number, dto: UpdateDelegationDto): Promise<import("../entities/user-delegation.entity").UserDelegation>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
