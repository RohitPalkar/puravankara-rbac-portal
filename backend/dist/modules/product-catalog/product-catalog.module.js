"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductCatalogModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const module_entity_1 = require("./entities/module.entity");
const sub_module_entity_1 = require("./entities/sub-module.entity");
const action_entity_1 = require("./entities/action.entity");
const module_action_entity_1 = require("./entities/module-action.entity");
const catalog_service_1 = require("./services/catalog.service");
const catalog_controller_1 = require("./controllers/catalog.controller");
let ProductCatalogModule = class ProductCatalogModule {
};
exports.ProductCatalogModule = ProductCatalogModule;
exports.ProductCatalogModule = ProductCatalogModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([module_entity_1.Module, sub_module_entity_1.SubModule, action_entity_1.Action, module_action_entity_1.ModuleAction]),
        ],
        controllers: [
            catalog_controller_1.ModuleController,
            catalog_controller_1.SubModuleController,
            catalog_controller_1.ActionController,
            catalog_controller_1.ModuleActionController,
        ],
        providers: [
            catalog_service_1.ModuleCatalogService,
            catalog_service_1.SubModuleCatalogService,
            catalog_service_1.ActionCatalogService,
            catalog_service_1.ModuleActionCatalogService,
        ],
        exports: [typeorm_1.TypeOrmModule],
    })
], ProductCatalogModule);
//# sourceMappingURL=product-catalog.module.js.map