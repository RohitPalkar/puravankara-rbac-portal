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
exports.ModuleActionController = exports.ActionController = exports.SubModuleController = exports.ModuleController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const catalog_service_1 = require("../services/catalog.service");
const base_controller_1 = require("../../../common/crud/base.controller");
let ModuleController = class ModuleController extends base_controller_1.BaseController {
    svc;
    constructor(svc) {
        super(svc, 'Module');
        this.svc = svc;
    }
    async getTree() {
        return this.svc.getTree();
    }
};
exports.ModuleController = ModuleController;
__decorate([
    (0, common_1.Get)('tree'),
    (0, swagger_1.ApiOperation)({ summary: 'Get module tree with sub-modules and actions' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ModuleController.prototype, "getTree", null);
exports.ModuleController = ModuleController = __decorate([
    (0, swagger_1.ApiTags)('Product Catalog - Modules'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('modules'),
    __metadata("design:paramtypes", [catalog_service_1.ModuleCatalogService])
], ModuleController);
let SubModuleController = class SubModuleController extends base_controller_1.BaseController {
    svc;
    constructor(svc) {
        super(svc, 'SubModule');
        this.svc = svc;
    }
};
exports.SubModuleController = SubModuleController;
exports.SubModuleController = SubModuleController = __decorate([
    (0, swagger_1.ApiTags)('Product Catalog - Sub Modules'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('sub-modules'),
    __metadata("design:paramtypes", [catalog_service_1.SubModuleCatalogService])
], SubModuleController);
let ActionController = class ActionController extends base_controller_1.BaseController {
    svc;
    constructor(svc) {
        super(svc, 'Action');
        this.svc = svc;
    }
};
exports.ActionController = ActionController;
exports.ActionController = ActionController = __decorate([
    (0, swagger_1.ApiTags)('Product Catalog - Actions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('actions'),
    __metadata("design:paramtypes", [catalog_service_1.ActionCatalogService])
], ActionController);
let ModuleActionController = class ModuleActionController extends base_controller_1.BaseController {
    svc;
    constructor(svc) {
        super(svc, 'ModuleAction');
        this.svc = svc;
    }
};
exports.ModuleActionController = ModuleActionController;
exports.ModuleActionController = ModuleActionController = __decorate([
    (0, swagger_1.ApiTags)('Product Catalog - Module Actions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('module-actions'),
    __metadata("design:paramtypes", [catalog_service_1.ModuleActionCatalogService])
], ModuleActionController);
//# sourceMappingURL=catalog.controller.js.map