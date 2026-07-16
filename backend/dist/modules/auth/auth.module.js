"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./services/auth.service");
const token_service_1 = require("./services/token.service");
const password_service_1 = require("./services/password.service");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const refresh_strategy_1 = require("./strategies/refresh.strategy");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const user_entity_1 = require("../users/entities/user.entity");
const user_auth_entity_1 = require("./entities/user-auth.entity");
const user_session_entity_1 = require("./entities/user-session.entity");
const user_role_entity_1 = require("../users/entities/user-role.entity");
const user_project_access_entity_1 = require("../project-access/entities/user-project-access.entity");
const audit_module_1 = require("../audit/audit.module");
const permissions_module_1 = require("../permissions/permissions.module");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, user_auth_entity_1.UserAuth, user_session_entity_1.UserSession, user_role_entity_1.UserRole, user_project_access_entity_1.UserProjectAccess]),
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'puravankara-rbac-jwt-secret-key-2026',
                signOptions: { expiresIn: 900 },
            }),
            (0, common_1.forwardRef)(() => permissions_module_1.PermissionsModule),
            audit_module_1.AuditModule,
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [
            auth_service_1.AuthService,
            token_service_1.TokenService,
            password_service_1.PasswordService,
            jwt_strategy_1.JwtStrategy,
            refresh_strategy_1.RefreshStrategy,
            jwt_auth_guard_1.JwtAuthGuard,
        ],
        exports: [
            auth_service_1.AuthService,
            token_service_1.TokenService,
            password_service_1.PasswordService,
            jwt_auth_guard_1.JwtAuthGuard,
            jwt_1.JwtModule,
            passport_1.PassportModule,
        ],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map