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
exports.DelegationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const delegation_service_1 = require("../services/delegation.service");
const create_delegation_dto_1 = require("../dto/create-delegation.dto");
const update_delegation_dto_1 = require("../dto/update-delegation.dto");
const delegation_query_dto_1 = require("../dto/delegation-query.dto");
const require_permission_decorator_1 = require("../../permissions/decorators/require-permission.decorator");
let DelegationController = class DelegationController {
    delegationService;
    constructor(delegationService) {
        this.delegationService = delegationService;
    }
    async findAll(query) {
        return this.delegationService.findAll(query);
    }
    async findById(id) {
        return this.delegationService.findById(id);
    }
    async create(dto) {
        return this.delegationService.create(dto);
    }
    async update(id, dto) {
        return this.delegationService.update(id, dto);
    }
    async remove(id) {
        await this.delegationService.remove(id);
        return { message: 'Delegation deleted successfully' };
    }
};
exports.DelegationController = DelegationController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)({ module: 'Delegation', action: 'VIEW' }),
    (0, swagger_1.ApiOperation)({ summary: 'List all delegations (paginated, filterable)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [delegation_query_dto_1.DelegationQueryDto]),
    __metadata("design:returntype", Promise)
], DelegationController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)({ module: 'Delegation', action: 'VIEW' }),
    (0, swagger_1.ApiOperation)({ summary: 'Get delegation details' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], DelegationController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)({ module: 'Delegation', action: 'CREATE' }),
    (0, swagger_1.ApiOperation)({ summary: 'Create a delegation' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Delegation created' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_delegation_dto_1.CreateDelegationDto]),
    __metadata("design:returntype", Promise)
], DelegationController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permission_decorator_1.RequirePermission)({ module: 'Delegation', action: 'UPDATE' }),
    (0, swagger_1.ApiOperation)({ summary: 'Update a delegation' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_delegation_dto_1.UpdateDelegationDto]),
    __metadata("design:returntype", Promise)
], DelegationController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permission_decorator_1.RequirePermission)({ module: 'Delegation', action: 'DELETE' }),
    (0, swagger_1.ApiOperation)({ summary: 'Soft delete a delegation' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], DelegationController.prototype, "remove", null);
exports.DelegationController = DelegationController = __decorate([
    (0, swagger_1.ApiTags)('Delegations'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('delegations'),
    __metadata("design:paramtypes", [delegation_service_1.DelegationService])
], DelegationController);
//# sourceMappingURL=delegation.controller.js.map