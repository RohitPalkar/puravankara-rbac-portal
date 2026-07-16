import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ChannelPartnerService } from '../services/channel-partner.service';
import { CreateChannelPartnerDto, UpdateChannelPartnerDto } from '../dto/channel-partner.dto';
import { ChannelPartner } from '../entities/channel-partner.entity';
import { BaseController } from '../../../common/crud/base.controller';

@ApiTags('Channel Partners')
@ApiBearerAuth()
@Controller('channel-partners')
export class ChannelPartnerController extends BaseController<
  ChannelPartner,
  CreateChannelPartnerDto,
  UpdateChannelPartnerDto
> {
  constructor(private readonly service: ChannelPartnerService) {
    super(service, 'ChannelPartner');
  }
}
