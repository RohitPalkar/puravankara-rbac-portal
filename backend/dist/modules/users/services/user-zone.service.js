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
exports.UserZoneService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_zone_entity_1 = require("../entities/user-zone.entity");
let UserZoneService = class UserZoneService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async findByUser(userId) {
        return this.repository.find({
            where: { userId },
            relations: { zone: true },
        });
    }
    async assign(userId, zoneId) {
        const existing = await this.repository.findOne({
            where: { userId, zoneId },
        });
        if (existing)
            return existing;
        const uz = this.repository.create({ userId, zoneId });
        return this.repository.save(uz);
    }
    async revoke(userId, zoneId) {
        const result = await this.repository.delete({ userId, zoneId });
        if (result.affected === 0)
            throw new common_1.NotFoundException('User zone mapping not found');
    }
    async revokeAll(userId) {
        await this.repository.delete({ userId });
    }
};
exports.UserZoneService = UserZoneService;
exports.UserZoneService = UserZoneService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_zone_entity_1.UserZone)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UserZoneService);
//# sourceMappingURL=user-zone.service.js.map