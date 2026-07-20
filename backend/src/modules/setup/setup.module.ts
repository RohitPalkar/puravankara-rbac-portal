import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SetupController } from './setup.controller';
import { SetupService } from './setup.service';
import { SystemSettingService } from './services/system-setting.service';
import { SystemSetting } from './entities/system-setting.entity';
import { Department } from '../organization/entities/department.entity';
import { Project } from '../projects/entities/project.entity';
import { Module as ProductModule } from '../product-catalog/entities/module.entity';
import { Zone } from '../geography/entities/zone.entity';
import { City } from '../geography/entities/city.entity';

import { Role } from '../organization/entities/role.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Department,
      Project,
      ProductModule,
      Zone,
      City,
      Role,
      User,
      SystemSetting,
    ]),
  ],
  controllers: [SetupController],
  providers: [SetupService, SystemSettingService],
  exports: [SystemSettingService],
})
export class SetupModule {}
