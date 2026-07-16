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
exports.UserReportingLineController = exports.UserRoleController = exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const user_service_1 = require("../services/user.service");
const user_dto_1 = require("../dto/user.dto");
const pagination_query_dto_1 = require("../../../common/dto/pagination-query.dto");
let UserController = class UserController {
    userService;
    constructor(userService) {
        this.userService = userService;
    }
    async findAll(query) {
        return this.userService.findAll(query);
    }
    async findById(id) {
        return this.userService.findById(id);
    }
    async create(dto) {
        return this.userService.create(dto);
    }
    async createFull(dto) {
        return this.userService.createFull(dto);
    }
    async update(id, dto) {
        return this.userService.update(id, dto);
    }
    async remove(id) {
        await this.userService.remove(id);
        return { message: 'User deleted successfully' };
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all users' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_query_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user by emp_id' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new user' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('full'),
    (0, swagger_1.ApiOperation)({ summary: 'Create user with roles, zones, and reporting hierarchy in a single transaction' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.CreateUserFullDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "createFull", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Soft delete user' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "remove", null);
exports.UserController = UserController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
let UserRoleController = class UserRoleController {
    userRoleService;
    constructor(userRoleService) {
        this.userRoleService = userRoleService;
    }
    async findByUser(userId) {
        return this.userRoleService.findByUser(userId);
    }
    async assign(dto) {
        return this.userRoleService.assign(dto);
    }
    async revoke(userId, departmentId, roleId) {
        await this.userRoleService.revoke(userId, departmentId, roleId);
        return { message: 'Role revoked successfully' };
    }
};
exports.UserRoleController = UserRoleController;
__decorate([
    (0, common_1.Get)(':userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get roles for a user' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserRoleController.prototype, "findByUser", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Assign role to user' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.CreateUserRoleDto]),
    __metadata("design:returntype", Promise)
], UserRoleController.prototype, "assign", null);
__decorate([
    (0, common_1.Delete)(':userId/department/:departmentId/role/:roleId'),
    (0, swagger_1.ApiOperation)({ summary: 'Revoke role from user' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('departmentId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Param)('roleId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], UserRoleController.prototype, "revoke", null);
exports.UserRoleController = UserRoleController = __decorate([
    (0, swagger_1.ApiTags)('Users - Roles'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('user-roles'),
    __metadata("design:paramtypes", [user_service_1.UserRoleService])
], UserRoleController);
let UserReportingLineController = class UserReportingLineController {
    rlService;
    constructor(rlService) {
        this.rlService = rlService;
    }
    async findByUser(userId) {
        return this.rlService.findByUser(userId);
    }
    async create(dto) {
        return this.rlService.create(dto);
    }
    async remove(userId, reportsToUserId, levelRank) {
        await this.rlService.remove(userId, reportsToUserId, levelRank);
        return { message: 'Reporting line removed successfully' };
    }
};
exports.UserReportingLineController = UserReportingLineController;
__decorate([
    (0, common_1.Get)(':userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get reporting lines for a user' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserReportingLineController.prototype, "findByUser", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create reporting line' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.CreateUserReportingLineDto]),
    __metadata("design:returntype", Promise)
], UserReportingLineController.prototype, "create", null);
__decorate([
    (0, common_1.Delete)(':userId/reports-to/:reportsToUserId/level/:levelRank'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove reporting line' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('reportsToUserId')),
    __param(2, (0, common_1.Param)('levelRank', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], UserReportingLineController.prototype, "remove", null);
exports.UserReportingLineController = UserReportingLineController = __decorate([
    (0, swagger_1.ApiTags)('Users - Reporting Lines'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('user-reporting-lines'),
    __metadata("design:paramtypes", [user_service_1.UserReportingLineService])
], UserReportingLineController);
//# sourceMappingURL=user.controller.js.map