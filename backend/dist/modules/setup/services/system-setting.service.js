"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemSettingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const system_setting_entity_1 = require("../entities/system-setting.entity");
let SystemSettingService = class SystemSettingService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async get(key) {
        const setting = await this.repo.findOne({ where: { key } });
        return setting?.value ?? null;
    }
    async set(key, value) {
        await this.repo.upsert({ key, value }, { conflictPaths: ['key'] });
    }
    async delete(key) {
        await this.repo.delete({ key });
    }
    async isSetupCompleted() {
        const val = await this.get('setup_completed');
        return val?.completed === true;
    }
    async markSetupCompleted() {
        await this.set('setup_completed', { completed: true });
    }
};
exports.SystemSettingService = SystemSettingService;
exports.SystemSettingService = SystemSettingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(system_setting_entity_1.SystemSetting)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SystemSettingService);
//# sourceMappingURL=system-setting.service.js.map