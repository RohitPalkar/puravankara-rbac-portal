"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetupModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const setup_controller_1 = require("./setup.controller");
const setup_service_1 = require("./setup.service");
const system_setting_service_1 = require("./services/system-setting.service");
const system_setting_entity_1 = require("./entities/system-setting.entity");
const department_entity_1 = require("../organization/entities/department.entity");
const project_entity_1 = require("../projects/entities/project.entity");
const module_entity_1 = require("../product-catalog/entities/module.entity");
const zone_entity_1 = require("../geography/entities/zone.entity");
const city_entity_1 = require("../geography/entities/city.entity");
const role_entity_1 = require("../organization/entities/role.entity");
const user_entity_1 = require("../users/entities/user.entity");
let SetupModule = class SetupModule {
};
exports.SetupModule = SetupModule;
exports.SetupModule = SetupModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([department_entity_1.Department, project_entity_1.Project, module_entity_1.Module, zone_entity_1.Zone, city_entity_1.City, role_entity_1.Role, user_entity_1.User, system_setting_entity_1.SystemSetting])],
        controllers: [setup_controller_1.SetupController],
        providers: [setup_service_1.SetupService, system_setting_service_1.SystemSettingService],
        exports: [system_setting_service_1.SystemSettingService],
    })
], SetupModule);
//# sourceMappingURL=setup.module.js.map