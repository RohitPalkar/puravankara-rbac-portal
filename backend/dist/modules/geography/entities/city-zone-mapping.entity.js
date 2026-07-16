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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CityZoneMapping = void 0;
const typeorm_1 = require("typeorm");
const city_entity_1 = require("./city.entity");
const zone_entity_1 = require("./zone.entity");
let CityZoneMapping = class CityZoneMapping {
    cityId;
    zoneId;
    city;
    zone;
    createdAt;
    updatedAt;
};
exports.CityZoneMapping = CityZoneMapping;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'city_id' }),
    __metadata("design:type", Number)
], CityZoneMapping.prototype, "cityId", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'zone_id' }),
    __metadata("design:type", Number)
], CityZoneMapping.prototype, "zoneId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => city_entity_1.City, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'city_id' }),
    __metadata("design:type", city_entity_1.City)
], CityZoneMapping.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => zone_entity_1.Zone, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'zone_id' }),
    __metadata("design:type", zone_entity_1.Zone)
], CityZoneMapping.prototype, "zone", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], CityZoneMapping.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], CityZoneMapping.prototype, "updatedAt", void 0);
exports.CityZoneMapping = CityZoneMapping = __decorate([
    (0, typeorm_1.Entity)('city_zone_mappings')
], CityZoneMapping);
//# sourceMappingURL=city-zone-mapping.entity.js.map