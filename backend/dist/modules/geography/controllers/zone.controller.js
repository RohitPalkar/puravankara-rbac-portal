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
exports.ZoneController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const zone_service_1 = require("../services/zone.service");
const base_controller_1 = require("../../../common/crud/base.controller");
let ZoneController = class ZoneController extends base_controller_1.BaseController {
    zoneService;
    constructor(zoneService) {
        super(zoneService, 'Zone');
        this.zoneService = zoneService;
    }
};
exports.ZoneController = ZoneController;
exports.ZoneController = ZoneController = __decorate([
    (0, swagger_1.ApiTags)('Geography - Zones'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('zones'),
    __metadata("design:paramtypes", [zone_service_1.ZoneService])
], ZoneController);
//# sourceMappingURL=zone.controller.js.map