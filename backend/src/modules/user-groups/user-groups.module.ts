import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserGroup } from './entities/user-group.entity';
import { UserGroupService } from './services/user-group.service';
import { UserGroupController } from './controllers/user-group.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserGroup])],
  controllers: [UserGroupController],
  providers: [UserGroupService],
  exports: [TypeOrmModule],
})
export class UserGroupsModule {}
