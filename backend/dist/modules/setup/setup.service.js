"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SetupService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetupService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const department_entity_1 = require("../organization/entities/department.entity");
const project_entity_1 = require("../projects/entities/project.entity");
const module_entity_1 = require("../product-catalog/entities/module.entity");
const zone_entity_1 = require("../geography/entities/zone.entity");
const city_entity_1 = require("../geography/entities/city.entity");
const role_entity_1 = require("../organization/entities/role.entity");
const user_entity_1 = require("../users/entities/user.entity");
const system_setting_service_1 = require("./services/system-setting.service");
let SetupService = SetupService_1 = class SetupService {
    deptRepo;
    projectRepo;
    moduleRepo;
    zoneRepo;
    cityRepo;
    roleRepo;
    userRepo;
    systemSettings;
    logger = new common_1.Logger(SetupService_1.name);
    ZONE_NAMES = ['North', 'South', 'East', 'West'];
    ZONE_CITIES = {
        North: ['Delhi', 'Chandigarh', 'Lucknow', 'Jaipur', 'Srinagar'],
        South: ['Bangalore', 'Chennai', 'Hyderabad', 'Kochi', 'Coimbatore'],
        East: ['Kolkata', 'Bhubaneswar', 'Patna', 'Guwahati', 'Ranchi'],
        West: ['Mumbai', 'Pune', 'Ahmedabad', 'Surat', 'Goa'],
    };
    constructor(deptRepo, projectRepo, moduleRepo, zoneRepo, cityRepo, roleRepo, userRepo, systemSettings) {
        this.deptRepo = deptRepo;
        this.projectRepo = projectRepo;
        this.moduleRepo = moduleRepo;
        this.zoneRepo = zoneRepo;
        this.cityRepo = cityRepo;
        this.roleRepo = roleRepo;
        this.userRepo = userRepo;
        this.systemSettings = systemSettings;
    }
    async getStatus() {
        const [deptCount, projectCount, moduleCount, zoneCount, cityCount, roleCount, totalUserCount, adminCount,] = await Promise.all([
            this.deptRepo.count({ where: { deletedAt: null } }),
            this.projectRepo.count({ where: { deletedAt: null } }),
            this.moduleRepo.count({ where: { isActive: true } }),
            this.zoneRepo.count({ where: { deletedAt: null } }),
            this.cityRepo.count({ where: { deletedAt: null } }),
            this.roleRepo.count({ where: { isSystemRole: false, deletedAt: null } }),
            this.userRepo.count({ where: { deletedAt: null } }),
            this.userRepo.count({ where: { deletedAt: null, email: 'admin@system.local' } }),
        ]);
        const entries = [
            ['department', deptCount],
            ['project', projectCount],
            ['module', moduleCount],
            ['zone', zoneCount],
            ['city', cityCount],
            ['role', roleCount],
            ['user', totalUserCount - adminCount],
        ];
        const required = [];
        const status = {};
        for (const [key, count] of entries) {
            const exists = count > 0;
            status[key] = { exists, count };
            if (!exists)
                required.push(key);
        }
        const setupCompleted = required.length === 0;
        if (setupCompleted) {
            await this.systemSettings.markSetupCompleted();
        }
        return {
            setupCompleted,
            required,
            status,
        };
    }
    async reset() {
        const ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || 'admin@system.local';
        const q = (sql, params) => this.zoneRepo.manager.query(sql, params);
        const hash = await bcrypt.hash(process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123456', 10);
        await q(`UPDATE user_auth SET is_locked = false, failed_attempts = 0, password_hash = $1 WHERE user_id IN (SELECT emp_id FROM users WHERE email = $2)`, [hash, ADMIN_EMAIL]);
        await q(`DELETE FROM user_permission_templates WHERE user_id IN (SELECT emp_id FROM users WHERE email != $1)`, [ADMIN_EMAIL]);
        await q(`DELETE FROM user_project_feature_matrix WHERE user_id IN (SELECT emp_id FROM users WHERE email != $1)`, [ADMIN_EMAIL]);
        await q(`DELETE FROM user_permission_overrides WHERE user_id IN (SELECT emp_id FROM users WHERE email != $1)`, [ADMIN_EMAIL]);
        await q(`DELETE FROM user_project_access WHERE user_id IN (SELECT emp_id FROM users WHERE email != $1)`, [ADMIN_EMAIL]);
        await q(`DELETE FROM user_reporting_lines WHERE user_id IN (SELECT emp_id FROM users WHERE email != $1)`, [ADMIN_EMAIL]);
        await q(`DELETE FROM user_zones WHERE user_id IN (SELECT emp_id FROM users WHERE email != $1)`, [ADMIN_EMAIL]);
        await q(`DELETE FROM user_roles WHERE user_id IN (SELECT emp_id FROM users WHERE email != $1)`, [ADMIN_EMAIL]);
        await q(`DELETE FROM user_auth WHERE user_id IN (SELECT emp_id FROM users WHERE email != $1)`, [ADMIN_EMAIL]);
        await q(`DELETE FROM users WHERE email != $1`, [ADMIN_EMAIL]);
        await q(`DELETE FROM city_zone_mappings`);
        await q(`DELETE FROM cities`);
        await q(`DELETE FROM zones`);
        for (const name of this.ZONE_NAMES) {
            await q(`INSERT INTO zones (name, is_active) VALUES ($1, true)`, [name]);
        }
        const allZones = await q(`SELECT id, name FROM zones`);
        for (const [zoneName, cityNames] of Object.entries(this.ZONE_CITIES)) {
            const zone = allZones.find((z) => z.name === zoneName);
            if (!zone)
                continue;
            for (const cityName of cityNames) {
                const r = await q(`INSERT INTO cities (name, is_active) VALUES ($1, true) RETURNING id`, [cityName]);
                await q(`INSERT INTO city_zone_mappings (city_id, zone_id) VALUES ($1, $2)`, [r[0].id, zone.id]);
            }
        }
        this.logger.log('Reset complete: zones/cities reseeded; non-admin users removed');
    }
};
exports.SetupService = SetupService;
exports.SetupService = SetupService = SetupService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(department_entity_1.Department)),
    __param(1, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    __param(2, (0, typeorm_1.InjectRepository)(module_entity_1.Module)),
    __param(3, (0, typeorm_1.InjectRepository)(zone_entity_1.Zone)),
    __param(4, (0, typeorm_1.InjectRepository)(city_entity_1.City)),
    __param(5, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __param(6, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        system_setting_service_1.SystemSettingService])
], SetupService);
//# sourceMappingURL=setup.service.js.map