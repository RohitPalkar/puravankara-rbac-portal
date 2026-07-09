import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { AuditQueryDto } from '../dto/audit-query.dto';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async createLog(params: {
    entityName: string;
    entityId?: string;
    action: string;
    oldValue?: Record<string, any>;
    newValue?: Record<string, any>;
    performedBy?: string;
    ipAddress?: string;
    userAgent?: string;
    requestId?: string;
    source?: string;
  }): Promise<AuditLog> {
    const log = this.auditRepo.create({
      entityName: params.entityName,
      entityId: params.entityId,
      action: params.action,
      oldValue: params.oldValue || null,
      newValue: params.newValue || null,
      performedBy: params.performedBy,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      requestId: params.requestId,
      source: params.source,
    });
    return this.auditRepo.save(log);
  }

  async findAll(query: AuditQueryDto) {
    const {
      page = 1,
      limit = 20,
      entityName,
      action,
      performedBy,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const where: any = {};

    if (entityName) where.entityName = entityName;
    if (action) where.action = action;
    if (performedBy) where.performedBy = performedBy;
    if (startDate && endDate) {
      where.createdAt = Between(new Date(startDate), new Date(endDate));
    }

    const [data, total] = await this.auditRepo.findAndCount({
      where,
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
