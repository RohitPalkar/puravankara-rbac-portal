import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../organization/entities/role.entity';
import { DepartmentRole } from '../organization/entities/department-role.entity';
import { Department } from '../organization/entities/department.entity';
import { PermissionTemplate } from '../permissions/entities/permission-template.entity';
import { TemplatePermission } from '../permissions/entities/template-permission.entity';
import { Module as ProductModule } from '../product-catalog/entities/module.entity';
import { SubModule } from '../product-catalog/entities/sub-module.entity';
import { Action } from '../product-catalog/entities/action.entity';
import { RoleMappingService } from './role-mapping.service';
import {
  RoleMappingController,
  DepartmentRolesController,
} from './role-mapping.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Role,
      DepartmentRole,
      Department,
      PermissionTemplate,
      TemplatePermission,
      ProductModule,
      SubModule,
      Action,
    ]),
  ],
  controllers: [
    RoleMappingController,
    DepartmentRolesController,
  ],
  providers: [RoleMappingService],
  exports: [RoleMappingService],
})
export class RoleMappingModule {}
