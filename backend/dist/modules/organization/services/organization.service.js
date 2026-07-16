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
exports.RoleService = exports.DepartmentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const department_entity_1 = require("../entities/department.entity");
const role_entity_1 = require("../entities/role.entity");
const base_service_1 = require("../../../common/crud/base.service");
const dependency_validator_service_1 = require("../../../common/services/dependency-validator.service");
let DepartmentService = class DepartmentService extends base_service_1.BaseService {
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
        await this.dependencyValidator.assertDepartmentDeletable(id);
        return super.remove(id);
    }
};
exports.DepartmentService = DepartmentService;
exports.DepartmentService = DepartmentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(department_entity_1.Department)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        dependency_validator_service_1.DependencyValidatorService])
], DepartmentService);
let RoleService = class RoleService extends base_service_1.BaseService {
    repository;
    deptRepo;
    dependencyValidator;
    constructor(repository, deptRepo, dependencyValidator) {
        super(repository);
        this.repository = repository;
        this.deptRepo = deptRepo;
        this.dependencyValidator = dependencyValidator;
    }
    async create(dto) {
        const defaultMaxLevels = 4;
        if (dto.hierarchyLevelRank > defaultMaxLevels) {
            throw new common_1.BadRequestException(`Role level ${dto.hierarchyLevelRank} exceeds maximum allowed hierarchy level (${defaultMaxLevels})`);
        }
        return super.create(dto);
    }
    async update(id, dto) {
        if (dto.hierarchyLevelRank != null) {
            const defaultMaxLevels = 4;
            if (dto.hierarchyLevelRank > defaultMaxLevels) {
                throw new common_1.BadRequestException(`Role level ${dto.hierarchyLevelRank} exceeds maximum allowed hierarchy level (${defaultMaxLevels})`);
            }
        }
        return super.update(id, dto);
    }
    async remove(id) {
        await this.dependencyValidator.assertRoleDeletable(id);
        return super.remove(id);
    }
};
exports.RoleService = RoleService;
exports.RoleService = RoleService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __param(1, (0, typeorm_1.InjectRepository)(department_entity_1.Department)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        dependency_validator_service_1.DependencyValidatorService])
], RoleService);
//# sourceMappingURL=organization.service.js.map