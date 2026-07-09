import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { UserDelegation } from '../../delegation/entities/user-delegation.entity';
import { UserRole } from '../../users/entities/user-role.entity';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class DelegationService {
  private readonly logger = new Logger(DelegationService.name);

  constructor(
    @InjectRepository(UserDelegation)
    private readonly delegationRepo: Repository<UserDelegation>,
    @InjectRepository(UserRole)
    private readonly userRoleRepo: Repository<UserRole>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findEligibleApprovers(
    departmentId: number,
    roleId: number,
    levelRank: number,
    moduleId?: number,
  ): Promise<string[]> {
    const userRoles = await this.userRoleRepo.find({
      where: { departmentId, roleId },
    });
    if (userRoles.length === 0) return [];

    const now = new Date();
    const approvers: string[] = [];

    for (const ur of userRoles) {
      const user = await this.userRepo.findOne({
        where: { empId: ur.userId, isActive: true },
      });
      if (!user || user.deletedAt) continue;

      const delegate = await this.findActiveDelegate(ur.userId, moduleId, now);
      if (delegate) {
        approvers.push(delegate);
        continue;
      }

      approvers.push(ur.userId);
    }

    return approvers;
  }

  private async findActiveDelegate(
    fromUserId: string,
    moduleId?: number,
    now?: Date,
  ): Promise<string | null> {
    const date = now || new Date();

    const where: any = {
      fromUserId,
      isActive: true,
      startDate: LessThanOrEqual(date),
    };

    if (moduleId) {
      where.moduleId = moduleId;
    }

    const delegation = await this.delegationRepo.findOne({ where });

    if (!delegation) return null;
    if (delegation.endDate && delegation.endDate < date) return null;

    return delegation.toUserId;
  }
}
