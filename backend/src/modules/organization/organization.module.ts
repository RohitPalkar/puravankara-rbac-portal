import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from './entities/department.entity';
import { Role } from './entities/role.entity';
import { DepartmentRole } from './entities/department-role.entity';
import {
  DepartmentService,
  RoleService,
} from './services/organization.service';
import { DepartmentRoleService } from './services/department-role.service';
import {
  DepartmentController,
  RoleController,
} from './controllers/organization.controller';
import { DepartmentRoleController } from './controllers/department-role.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Department, Role, DepartmentRole])],
  controllers: [DepartmentController, RoleController, DepartmentRoleController],
  providers: [DepartmentService, RoleService, DepartmentRoleService],
  exports: [TypeOrmModule],
})
export class OrganizationModule {}
