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
exports.CityController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const city_service_1 = require("../services/city.service");
const base_controller_1 = require("../../../common/crud/base.controller");
let CityController = class CityController extends base_controller_1.BaseController {
    cityService;
    constructor(cityService) {
        super(cityService, 'City');
        this.cityService = cityService;
    }
};
exports.CityController = CityController;
exports.CityController = CityController = __decorate([
    (0, swagger_1.ApiTags)('Geography - Cities'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('cities'),
    __metadata("design:paramtypes", [city_service_1.CityService])
], CityController);
//# sourceMappingURL=city.controller.js.map