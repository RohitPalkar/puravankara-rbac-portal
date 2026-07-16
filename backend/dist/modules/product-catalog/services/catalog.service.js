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
exports.ModuleActionCatalogService = exports.ActionCatalogService = exports.SubModuleCatalogService = exports.ModuleCatalogService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const module_entity_1 = require("../entities/module.entity");
const sub_module_entity_1 = require("../entities/sub-module.entity");
const action_entity_1 = require("../entities/action.entity");
const module_action_entity_1 = require("../entities/module-action.entity");
const base_service_1 = require("../../../common/crud/base.service");
const dependency_validator_service_1 = require("../../../common/services/dependency-validator.service");
let ModuleCatalogService = class ModuleCatalogService extends base_service_1.BaseService {
    repository;
    dependencyValidator;
    constructor(repository, dependencyValidator) {
        super(repository);
        this.repository = repository;
        this.dependencyValidator = dependencyValidator;
    }
    async create(dto) {
        return super.create(dto);
    }
    async update(id, dto) {
        return super.update(id, dto);
    }
    async remove(id) {
        await this.dependencyValidator.assertModuleDeletable(id);
        return super.remove(id);
    }
    async getTree() {
        const modules = await this.repository.find({
            where: { isActive: true },
            order: { name: 'ASC' },
        });
        const subModules = await this.repository.manager
            .getRepository(sub_module_entity_1.SubModule)
            .find({ where: { isActive: true }, order: { name: 'ASC' } });
        const actions = await this.repository.manager
            .getRepository(action_entity_1.Action)
            .find({ where: { isActive: true }, order: { code: 'ASC' } });
        const moduleActions = await this.repository.manager
            .getRepository(module_action_entity_1.ModuleAction)
            .find({ where: { isActive: true } });
        return modules.map((mod) => {
            const modSubModules = subModules.filter((sm) => sm.moduleId === mod.id);
            const modDirectActions = moduleActions.filter((ma) => ma.moduleId === mod.id && !ma.subModuleId);
            const modActionIds = new Set(modDirectActions.map((ma) => ma.actionId));
            const modActions = actions.filter((a) => modActionIds.has(a.id));
            return {
                id: mod.id,
                name: mod.name,
                subModules: modSubModules.map((sm) => {
                    const smModuleActions = moduleActions.filter((ma) => ma.moduleId === mod.id && ma.subModuleId === sm.id);
                    const smActionIds = new Set(smModuleActions.map((ma) => ma.actionId));
                    return {
                        id: sm.id,
                        name: sm.name,
                        actions: actions
                            .filter((a) => smActionIds.has(a.id))
                            .map((a) => ({ id: a.id, code: a.code, label: a.label })),
                    };
                }),
                actions: modActions.map((a) => ({
                    id: a.id,
                    code: a.code,
                    label: a.label,
                })),
            };
        });
    }
};
exports.ModuleCatalogService = ModuleCatalogService;
exports.ModuleCatalogService = ModuleCatalogService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(module_entity_1.Module)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        dependency_validator_service_1.DependencyValidatorService])
], ModuleCatalogService);
let SubModuleCatalogService = class SubModuleCatalogService extends base_service_1.BaseService {
    repository;
    constructor(repository) {
        super(repository);
        this.repository = repository;
    }
    async create(dto) {
        return super.create(dto);
    }
    async update(id, dto) {
        return super.update(id, dto);
    }
};
exports.SubModuleCatalogService = SubModuleCatalogService;
exports.SubModuleCatalogService = SubModuleCatalogService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(sub_module_entity_1.SubModule)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SubModuleCatalogService);
let ActionCatalogService = class ActionCatalogService extends base_service_1.BaseService {
    repository;
    constructor(repository) {
        super(repository);
        this.repository = repository;
    }
    async create(dto) {
        return super.create(dto);
    }
    async update(id, dto) {
        return super.update(id, dto);
    }
};
exports.ActionCatalogService = ActionCatalogService;
exports.ActionCatalogService = ActionCatalogService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(action_entity_1.Action)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ActionCatalogService);
let ModuleActionCatalogService = class ModuleActionCatalogService extends base_service_1.BaseService {
    repository;
    constructor(repository) {
        super(repository);
        this.repository = repository;
    }
    async create(dto) {
        return super.create(dto);
    }
    async update(id, dto) {
        return super.update(id, dto);
    }
};
exports.ModuleActionCatalogService = ModuleActionCatalogService;
exports.ModuleActionCatalogService = ModuleActionCatalogService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(module_action_entity_1.ModuleAction)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ModuleActionCatalogService);
//# sourceMappingURL=catalog.service.js.map