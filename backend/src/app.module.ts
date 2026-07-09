import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { databaseConfig } from './config/database.config';
import { envValidationSchema } from './config/env.validation';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { PermissionGuard } from './modules/permissions/guards/permission.guard';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { GeographyModule } from './modules/geography/geography.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductCatalogModule } from './modules/product-catalog/product-catalog.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { ProjectAccessModule } from './modules/project-access/project-access.module';
import { WorkflowsModule } from './modules/workflows/workflows.module';
import { DelegationModule } from './modules/delegation/delegation.module';
import { AuditModule } from './modules/audit/audit.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { HealthModule } from './modules/health/health.module';
import { SetupModule } from './modules/setup/setup.module';
import { CommonModule } from './common/common.module';
import { RoleMappingModule } from './modules/role-mapping/role-mapping.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: envValidationSchema,
    }),
    TypeOrmModule.forRoot(databaseConfig),
    ThrottlerModule.forRoot([
      {
        name: 'api',
        ttl: Number(process.env.THROTTLE_TTL || 60) * 1000,
        limit: Number(process.env.THROTTLE_LIMIT || 100),
      },
    ]),
    GeographyModule,
    ProjectsModule,
    OrganizationModule,
    UsersModule,
    AuthModule,
    ProductCatalogModule,
    PermissionsModule,
    ProjectAccessModule,
    WorkflowsModule,
    DelegationModule,
    NotificationsModule,
    AuditModule,
    HealthModule,
    SetupModule,
    CommonModule,
    RoleMappingModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionGuard },
  ],
})
export class AppModule {}
