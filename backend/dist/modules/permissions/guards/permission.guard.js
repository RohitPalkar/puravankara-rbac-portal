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
exports.PermissionGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const permission_service_1 = require("../services/permission.service");
const user_role_entity_1 = require("../../users/entities/user-role.entity");
const require_permission_decorator_1 = require("../decorators/require-permission.decorator");
const public_decorator_1 = require("../../auth/decorators/public.decorator");
let PermissionGuard = class PermissionGuard {
    reflector;
    permissionService;
    userRoleRepo;
    constructor(reflector, permissionService, userRoleRepo) {
        this.reflector = reflector;
        this.permissionService = permissionService;
        this.userRoleRepo = userRoleRepo;
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(public_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.ForbiddenException('User not authenticated');
        }
        const userId = user.empId || user.userId;
        const isSuperAdmin = await this.isSuperAdmin(userId);
        if (isSuperAdmin) {
            return true;
        }
        const permission = this.reflector.getAllAndOverride(require_permission_decorator_1.PERMISSION_KEY, [context.getHandler(), context.getClass()]);
        const method = request.method?.toUpperCase();
        const isSafeMethod = method === 'GET' || method === 'HEAD' || method === 'OPTIONS';
        if (!permission) {
            if (isSafeMethod) {
                return true;
            }
            throw new common_1.ForbiddenException('Insufficient permissions. Contact administrator.');
        }
        const projectId = this.extractProjectId(request);
        if (!projectId) {
            throw new common_1.ForbiddenException('Project ID is required');
        }
        await this.permissionService.assertOrThrow({
            userId,
            projectId,
            moduleCode: permission.module,
            actionCode: permission.action,
        });
        return true;
    }
    async isSuperAdmin(userId) {
        const roles = await this.userRoleRepo.find({
            where: { userId },
            relations: { role: true },
        });
        return roles.some((ur) => ur.role?.isSystemRole === true ||
            ur.role?.name === 'SUPER_ADMIN');
    }
    extractProjectId(request) {
        const headerId = request.headers['x-project-id'];
        if (headerId)
            return Number(headerId);
        const paramId = request.params?.projectId;
        if (paramId)
            return Number(paramId);
        const bodyId = request.body?.projectId;
        if (bodyId)
            return Number(bodyId);
        return null;
    }
};
exports.PermissionGuard = PermissionGuard;
exports.PermissionGuard = PermissionGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(user_role_entity_1.UserRole)),
    __metadata("design:paramtypes", [core_1.Reflector,
        permission_service_1.PermissionService,
        typeorm_2.Repository])
], PermissionGuard);
//# sourceMappingURL=permission.guard.js.map