import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SeedService } from './seeders/seed.service';
import { databaseConfig } from '../config/database.config';
import { Role } from '../modules/organization/entities/role.entity';
import { Action } from '../modules/product-catalog/entities/action.entity';
import { User } from '../modules/users/entities/user.entity';
import { UserAuth } from '../modules/auth/entities/user-auth.entity';
import { UserRole } from '../modules/users/entities/user-role.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRoot(databaseConfig),
    TypeOrmModule.forFeature([Role, Action, User, UserAuth, UserRole]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
