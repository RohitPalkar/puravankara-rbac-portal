"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedProdModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const database_config_1 = require("../config/database.config");
const role_entity_1 = require("../modules/organization/entities/role.entity");
const action_entity_1 = require("../modules/product-catalog/entities/action.entity");
const user_entity_1 = require("../modules/users/entities/user.entity");
const user_auth_entity_1 = require("../modules/auth/entities/user-auth.entity");
const user_role_entity_1 = require("../modules/users/entities/user-role.entity");
let SeedProdModule = class SeedProdModule {
};
exports.SeedProdModule = SeedProdModule;
exports.SeedProdModule = SeedProdModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
            typeorm_1.TypeOrmModule.forRoot(database_config_1.databaseConfig),
            typeorm_1.TypeOrmModule.forFeature([role_entity_1.Role, action_entity_1.Action, user_entity_1.User, user_auth_entity_1.UserAuth, user_role_entity_1.UserRole]),
        ],
    })
], SeedProdModule);
//# sourceMappingURL=seed-prod.module.js.map