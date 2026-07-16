import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChannelPartnerType } from '../entities/channel-partner-type.entity';
import { BaseService } from '../../../common/crud/base.service';
import { CreateChannelPartnerTypeDto, UpdateChannelPartnerTypeDto } from '../dto/channel-partner-type.dto';

@Injectable()
export class ChannelPartnerTypeService extends BaseService<ChannelPartnerType> {
  constructor(
    @InjectRepository(ChannelPartnerType)
    readonly repository: Repository<ChannelPartnerType>,
  ) {
    super(repository);
  }

  async create(dto: CreateChannelPartnerTypeDto): Promise<ChannelPartnerType> {
    return super.create(dto);
  }

  async update(id: number, dto: UpdateChannelPartnerTypeDto): Promise<ChannelPartnerType> {
    return super.update(id, dto);
  }
}
