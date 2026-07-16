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
var DelegationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DelegationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_delegation_entity_1 = require("../../delegation/entities/user-delegation.entity");
const user_role_entity_1 = require("../../users/entities/user-role.entity");
const user_entity_1 = require("../../users/entities/user.entity");
let DelegationService = DelegationService_1 = class DelegationService {
    delegationRepo;
    userRoleRepo;
    userRepo;
    logger = new common_1.Logger(DelegationService_1.name);
    constructor(delegationRepo, userRoleRepo, userRepo) {
        this.delegationRepo = delegationRepo;
        this.userRoleRepo = userRoleRepo;
        this.userRepo = userRepo;
    }
    async findEligibleApprovers(departmentId, roleId, levelRank, moduleId) {
        const userRoles = await this.userRoleRepo.find({
            where: { departmentId, roleId },
        });
        if (userRoles.length === 0)
            return [];
        const now = new Date();
        const approvers = [];
        for (const ur of userRoles) {
            const user = await this.userRepo.findOne({
                where: { empId: ur.userId, isActive: true },
            });
            if (!user || user.deletedAt)
                continue;
            const delegate = await this.findActiveDelegate(ur.userId, moduleId, now);
            if (delegate) {
                approvers.push(delegate);
                continue;
            }
            approvers.push(ur.userId);
        }
        return approvers;
    }
    async findActiveDelegate(fromUserId, moduleId, now) {
        const date = now || new Date();
        const where = {
            fromUserId,
            isActive: true,
            startDate: (0, typeorm_2.LessThanOrEqual)(date),
        };
        if (moduleId) {
            where.moduleId = moduleId;
        }
        const delegation = await this.delegationRepo.findOne({ where });
        if (!delegation)
            return null;
        if (delegation.endDate && delegation.endDate < date)
            return null;
        return delegation.toUserId;
    }
};
exports.DelegationService = DelegationService;
exports.DelegationService = DelegationService = DelegationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_delegation_entity_1.UserDelegation)),
    __param(1, (0, typeorm_1.InjectRepository)(user_role_entity_1.UserRole)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], DelegationService);
//# sourceMappingURL=delegation.service.js.map