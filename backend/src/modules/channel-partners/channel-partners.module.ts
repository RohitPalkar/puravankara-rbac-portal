import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelPartner } from './entities/channel-partner.entity';
import { ChannelPartnerService } from './services/channel-partner.service';
import { ChannelPartnerController } from './controllers/channel-partner.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ChannelPartner])],
  controllers: [ChannelPartnerController],
  providers: [ChannelPartnerService],
  exports: [TypeOrmModule],
})
export class ChannelPartnersModule {}
