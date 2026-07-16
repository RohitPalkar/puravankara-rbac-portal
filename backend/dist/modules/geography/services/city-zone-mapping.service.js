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
exports.CityZoneMappingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const city_zone_mapping_entity_1 = require("../entities/city-zone-mapping.entity");
let CityZoneMappingService = class CityZoneMappingService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async findAll() {
        return this.repository.find({ relations: { city: true, zone: true } });
    }
    async create(dto) {
        const existing = await this.repository.findOne({
            where: { cityId: dto.cityId, zoneId: dto.zoneId },
        });
        if (existing)
            throw new common_1.ConflictException('Mapping already exists');
        const mapping = this.repository.create(dto);
        return this.repository.save(mapping);
    }
    async remove(cityId, zoneId) {
        const result = await this.repository.delete({ cityId, zoneId });
        if (result.affected === 0)
            throw new common_1.NotFoundException('Mapping not found');
    }
};
exports.CityZoneMappingService = CityZoneMappingService;
exports.CityZoneMappingService = CityZoneMappingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(city_zone_mapping_entity_1.CityZoneMapping)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CityZoneMappingService);
//# sourceMappingURL=city-zone-mapping.service.js.map