import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ChannelPartnerTypeService } from '../services/channel-partner-type.service';
import {
  CreateChannelPartnerTypeDto,
  UpdateChannelPartnerTypeDto,
} from '../dto/channel-partner-type.dto';
import { ChannelPartnerType } from '../entities/channel-partner-type.entity';
import { BaseController } from '../../../common/crud/base.controller';

@ApiTags('Channel Partner Types')
@ApiBearerAuth()
@Controller('channel-partner-types')
export class ChannelPartnerTypeController extends BaseController<
  ChannelPartnerType,
  CreateChannelPartnerTypeDto,
  UpdateChannelPartnerTypeDto
> {
  constructor(protected readonly service: ChannelPartnerTypeService) {
    super(service, 'ChannelPartnerType');
  }
}
