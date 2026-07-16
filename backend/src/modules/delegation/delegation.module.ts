import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserDelegation } from './entities/user-delegation.entity';
import { User } from '../users/entities/user.entity';
import { DelegationService } from './services/delegation.service';
import { DelegationController } from './controllers/delegation.controller';
import { AuditModule } from '../audit/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserDelegation, User]),
    AuditModule,
    NotificationsModule,
  ],
  controllers: [DelegationController],
  providers: [DelegationService],
  exports: [DelegationService, TypeOrmModule],
})
export class DelegationModule {}
