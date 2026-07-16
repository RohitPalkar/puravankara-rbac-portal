import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { User } from '../../users/entities/user.entity';
import { Module } from '../../product-catalog/entities/module.entity';
export declare class UserDelegation extends AppBaseEntity {
    fromUserId: string;
    fromUser: User;
    toUserId: string;
    toUser: User;
    moduleId: number;
    startDate: Date;
    endDate: Date;
    reason: string;
    isActive: boolean;
    module: Module;
}
