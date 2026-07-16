"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeographyModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const zone_entity_1 = require("./entities/zone.entity");
const city_entity_1 = require("./entities/city.entity");
const city_zone_mapping_entity_1 = require("./entities/city-zone-mapping.entity");
const zone_service_1 = require("./services/zone.service");
const city_service_1 = require("./services/city.service");
const city_zone_mapping_service_1 = require("./services/city-zone-mapping.service");
const zone_controller_1 = require("./controllers/zone.controller");
const city_controller_1 = require("./controllers/city.controller");
const city_zone_mapping_controller_1 = require("./controllers/city-zone-mapping.controller");
let GeographyModule = class GeographyModule {
};
exports.GeographyModule = GeographyModule;
exports.GeographyModule = GeographyModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([zone_entity_1.Zone, city_entity_1.City, city_zone_mapping_entity_1.CityZoneMapping])],
        controllers: [zone_controller_1.ZoneController, city_controller_1.CityController, city_zone_mapping_controller_1.CityZoneMappingController],
        providers: [zone_service_1.ZoneService, city_service_1.CityService, city_zone_mapping_service_1.CityZoneMappingService],
        exports: [typeorm_1.TypeOrmModule],
    })
], GeographyModule);
//# sourceMappingURL=geography.module.js.map