import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, And } from 'typeorm';
import { UserDelegation } from '../entities/user-delegation.entity';
import { User } from '../../users/entities/user.entity';
import { CreateDelegationDto } from '../dto/create-delegation.dto';
import { UpdateDelegationDto } from '../dto/update-delegation.dto';
import { DelegationQueryDto } from '../dto/delegation-query.dto';
import { NotificationService } from '../../notifications/services/notification.service';

@Injectable()
export class DelegationService {
  private readonly logger = new Logger(DelegationService.name);

  constructor(
    @InjectRepository(UserDelegation)
    private readonly delegationRepo: Repository<UserDelegation>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly notifService: NotificationService,
  ) {}

  async findAll(query: DelegationQueryDto) {
    const {
      page = 1,
      limit = 20,
      fromUserId,
      toUserId,
      moduleId,
      isActive,
      search,
    } = query;
    const where: any = {};

    if (fromUserId) where.fromUserId = fromUserId;
    if (toUserId) where.toUserId = toUserId;
    if (moduleId) where.moduleId = moduleId;
    if (isActive !== undefined) where.isActive = isActive;

    const [data, total] = await this.delegationRepo.findAndCount({
      where,
      relations: { module: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: number): Promise<UserDelegation> {
    const delegation = await this.delegationRepo.findOne({
      where: { id },
      relations: { module: true },
    });
    if (!delegation) throw new NotFoundException('Delegation not found');
    return delegation;
  }

  async create(dto: CreateDelegationDto): Promise<UserDelegation> {
    if (dto.fromUserId === dto.toUserId) {
      throw new BadRequestException('Cannot delegate to self');
    }

    if (
      dto.startDate &&
      dto.endDate &&
      new Date(dto.startDate) > new Date(dto.endDate)
    ) {
      throw new BadRequestException('Start date cannot be after end date');
    }

    const fromUser = await this.userRepo.findOne({
      where: { empId: dto.fromUserId, isActive: true },
    });
    if (!fromUser)
      throw new BadRequestException('Source user not found or inactive');

    const toUser = await this.userRepo.findOne({
      where: { empId: dto.toUserId, isActive: true },
    });
    if (!toUser)
      throw new BadRequestException('Target user not found or inactive');

    if (dto.startDate && dto.endDate) {
      const overlapping = await this.delegationRepo.findOne({
        where: {
          fromUserId: dto.fromUserId,
          isActive: true,
          startDate: LessThanOrEqual(new Date(dto.endDate)),
          endDate: MoreThanOrEqual(new Date(dto.startDate)),
        },
      });
      if (overlapping) {
        throw new BadRequestException(
          'Overlapping active delegation exists for this period',
        );
      }
    }

    const delegation = this.delegationRepo.create({
      fromUserId: dto.fromUserId,
      toUserId: dto.toUserId,
      moduleId: dto.moduleId,
      startDate: dto.startDate ? new Date(dto.startDate) : null,
      endDate: dto.endDate ? new Date(dto.endDate) : null,
      reason: dto.reason,
      isActive: true,
    });

    const saved = await this.delegationRepo.save(delegation);

    this.notifService
      .sendToUser(
        dto.fromUserId,
        'Delegation Created',
        `Your approvals have been delegated to ${dto.toUserId}${dto.reason ? `: ${dto.reason}` : ''}`,
        'DELEGATION',
        String(saved.id),
        'DELEGATION',
        'HIGH',
      )
      .catch((err) => this.logger.error('Failed to send delegation-created notification to fromUser', err));

    this.notifService
      .sendToUser(
        dto.toUserId,
        'Delegation Received',
        `You have been delegated to handle approvals for ${dto.fromUserId}`,
        'DELEGATION',
        String(saved.id),
        'DELEGATION',
        'HIGH',
      )
      .catch((err) => this.logger.error('Failed to send delegation-received notification to toUser', err));

    return saved;
  }

  async update(id: number, dto: UpdateDelegationDto): Promise<UserDelegation> {
    const delegation = await this.findById(id);

    if (dto.toUserId && delegation.fromUserId === dto.toUserId) {
      throw new BadRequestException('Cannot delegate to self');
    }

    if (dto.toUserId) {
      const toUser = await this.userRepo.findOne({
        where: { empId: dto.toUserId, isActive: true },
      });
      if (!toUser)
        throw new BadRequestException('Target user not found or inactive');
    }

    const startDate = dto.startDate
      ? new Date(dto.startDate)
      : delegation.startDate;
    const endDate = dto.endDate ? new Date(dto.endDate) : delegation.endDate;

    if (startDate && endDate && startDate > endDate) {
      throw new BadRequestException('Start date cannot be after end date');
    }

    Object.assign(delegation, {
      toUserId: dto.toUserId ?? delegation.toUserId,
      moduleId: dto.moduleId ?? delegation.moduleId,
      startDate: dto.startDate ? new Date(dto.startDate) : delegation.startDate,
      endDate: dto.endDate ? new Date(dto.endDate) : delegation.endDate,
      reason: dto.reason ?? delegation.reason,
      isActive: dto.isActive ?? delegation.isActive,
    });

    return this.delegationRepo.save(delegation);
  }

  async remove(id: number): Promise<void> {
    const delegation = await this.findById(id);
    (delegation as any).deletedAt = new Date();
    await this.delegationRepo.save(delegation);
  }
}
