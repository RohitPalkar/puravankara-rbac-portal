import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../modules/users/entities/user.entity';
import { UserRole } from '../modules/users/entities/user-role.entity';
import { RoleProjectPermission } from '../modules/permissions/entities/role-project-permission.entity';
import { TemplatePermission } from '../modules/permissions/entities/template-permission.entity';
import { ModuleAction } from '../modules/product-catalog/entities/module-action.entity';
import { DepartmentRole } from '../modules/organization/entities/department-role.entity';
import { DependencyValidatorService } from './services/dependency-validator.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserRole,
      RoleProjectPermission,
      TemplatePermission,
      ModuleAction,
      DepartmentRole,
    ]),
  ],
  providers: [DependencyValidatorService],
  exports: [DependencyValidatorService],
})
export class CommonModule {}
