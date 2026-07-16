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
exports.PermissionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const permission_service_1 = require("./services/permission.service");
const permission_compiler_service_1 = require("./services/permission-compiler.service");
const explain_permission_dto_1 = require("./dto/explain-permission.dto");
let PermissionController = class PermissionController {
    permissionService;
    compilerService;
    constructor(permissionService, compilerService) {
        this.permissionService = permissionService;
        this.compilerService = compilerService;
    }
    async getMyPermissions(req) {
        const userId = req.user?.empId || req.user?.userId;
        return this.permissionService.getUserPermissions(userId);
    }
    async compile(userId, projectId) {
        await this.compilerService.compileAndSave(userId, projectId);
        return { message: 'Permission snapshot compiled' };
    }
    async compileAll(userId) {
        await this.compilerService.compileForAllUserProjects(userId);
        return { message: 'Permission snapshots compiled for all projects' };
    }
    async getSnapshot(userId, projectId) {
        return this.compilerService.getCompiled(userId, projectId);
    }
    async getUserPermissions(userId) {
        return this.permissionService.getUserPermissions(userId);
    }
    async explain(dto) {
        return this.permissionService.explain({
            userId: dto.userId,
            projectId: dto.projectId,
            moduleCode: dto.module,
            actionCode: dto.action,
        });
    }
};
exports.PermissionController = PermissionController;
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user permissions for frontend' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PermissionController.prototype, "getMyPermissions", null);
__decorate([
    (0, common_1.Post)('compile/:userId/:projectId'),
    (0, swagger_1.ApiOperation)({ summary: 'Compile and cache permission snapshot for user+project' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], PermissionController.prototype, "compile", null);
__decorate([
    (0, common_1.Post)('compile/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Compile permission snapshots for all user projects' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PermissionController.prototype, "compileAll", null);
__decorate([
    (0, common_1.Get)('snapshot/:userId/:projectId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get compiled permission snapshot' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], PermissionController.prototype, "getSnapshot", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get permissions for a specific user' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PermissionController.prototype, "getUserPermissions", null);
__decorate([
    (0, common_1.Post)('explain'),
    (0, swagger_1.ApiOperation)({ summary: 'Explain why a user has or does not have access' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [explain_permission_dto_1.ExplainPermissionDto]),
    __metadata("design:returntype", Promise)
], PermissionController.prototype, "explain", null);
exports.PermissionController = PermissionController = __decorate([
    (0, swagger_1.ApiTags)('Permissions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('permissions'),
    __metadata("design:paramtypes", [permission_service_1.PermissionService,
        permission_compiler_service_1.PermissionCompilerService])
], PermissionController);
//# sourceMappingURL=permission.controller.js.map