import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelPartnerType } from './entities/channel-partner-type.entity';
import { ChannelPartnerTypeService } from './services/channel-partner-type.service';
import { ChannelPartnerTypeController } from './controllers/channel-partner-type.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ChannelPartnerType])],
  controllers: [ChannelPartnerTypeController],
  providers: [ChannelPartnerTypeService],
  exports: [TypeOrmModule],
})
export class ChannelPartnerTypesModule {}
