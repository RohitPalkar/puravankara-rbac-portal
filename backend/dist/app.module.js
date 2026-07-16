"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const database_config_1 = require("./config/database.config");
const env_validation_1 = require("./config/env.validation");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
const permission_guard_1 = require("./modules/permissions/guards/permission.guard");
const jwt_auth_guard_1 = require("./modules/auth/guards/jwt-auth.guard");
const brands_module_1 = require("./modules/brands/brands.module");
const geography_module_1 = require("./modules/geography/geography.module");
const projects_module_1 = require("./modules/projects/projects.module");
const organization_module_1 = require("./modules/organization/organization.module");
const users_module_1 = require("./modules/users/users.module");
const auth_module_1 = require("./modules/auth/auth.module");
const product_catalog_module_1 = require("./modules/product-catalog/product-catalog.module");
const permissions_module_1 = require("./modules/permissions/permissions.module");
const project_access_module_1 = require("./modules/project-access/project-access.module");
const workflows_module_1 = require("./modules/workflows/workflows.module");
const delegation_module_1 = require("./modules/delegation/delegation.module");
const audit_module_1 = require("./modules/audit/audit.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const health_module_1 = require("./modules/health/health.module");
const setup_module_1 = require("./modules/setup/setup.module");
const common_module_1 = require("./common/common.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
                validationSchema: env_validation_1.envValidationSchema,
            }),
            typeorm_1.TypeOrmModule.forRoot(database_config_1.databaseConfig),
            throttler_1.ThrottlerModule.forRoot([
                {
                    name: 'api',
                    ttl: Number(process.env.THROTTLE_TTL || 60) * 1000,
                    limit: Number(process.env.THROTTLE_LIMIT || 100),
                },
            ]),
            brands_module_1.BrandsModule,
            geography_module_1.GeographyModule,
            projects_module_1.ProjectsModule,
            organization_module_1.OrganizationModule,
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            product_catalog_module_1.ProductCatalogModule,
            permissions_module_1.PermissionsModule,
            project_access_module_1.ProjectAccessModule,
            workflows_module_1.WorkflowsModule,
            delegation_module_1.DelegationModule,
            notifications_module_1.NotificationsModule,
            audit_module_1.AuditModule,
            health_module_1.HealthModule,
            setup_module_1.SetupModule,
            common_module_1.CommonModule,
        ],
        providers: [
            { provide: core_1.APP_FILTER, useClass: http_exception_filter_1.AllExceptionsFilter },
            { provide: core_1.APP_INTERCEPTOR, useClass: transform_interceptor_1.TransformInterceptor },
            { provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard },
            { provide: core_1.APP_GUARD, useClass: jwt_auth_guard_1.JwtAuthGuard },
            { provide: core_1.APP_GUARD, useClass: permission_guard_1.PermissionGuard },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map