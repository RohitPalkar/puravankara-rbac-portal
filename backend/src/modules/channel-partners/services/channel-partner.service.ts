import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChannelPartner } from '../entities/channel-partner.entity';
import { BaseService } from '../../../common/crud/base.service';
import { CreateChannelPartnerDto, UpdateChannelPartnerDto } from '../dto/channel-partner.dto';

@Injectable()
export class ChannelPartnerService extends BaseService<ChannelPartner> {
  constructor(
    @InjectRepository(ChannelPartner)
    readonly repository: Repository<ChannelPartner>,
  ) {
    super(repository);
  }

  async create(dto: CreateChannelPartnerDto): Promise<ChannelPartner> {
    return super.create(dto);
  }

  async update(id: number, dto: UpdateChannelPartnerDto): Promise<ChannelPartner> {
    return super.update(id, dto);
  }
}
