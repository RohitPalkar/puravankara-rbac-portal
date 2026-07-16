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
const user_delegation_entity_1 = require("../entities/user-delegation.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const notification_service_1 = require("../../notifications/services/notification.service");
let DelegationService = DelegationService_1 = class DelegationService {
    delegationRepo;
    userRepo;
    notifService;
    logger = new common_1.Logger(DelegationService_1.name);
    constructor(delegationRepo, userRepo, notifService) {
        this.delegationRepo = delegationRepo;
        this.userRepo = userRepo;
        this.notifService = notifService;
    }
    async findAll(query) {
        const { page = 1, limit = 20, fromUserId, toUserId, moduleId, isActive, search, } = query;
        const where = {};
        if (fromUserId)
            where.fromUserId = fromUserId;
        if (toUserId)
            where.toUserId = toUserId;
        if (moduleId)
            where.moduleId = moduleId;
        if (isActive !== undefined)
            where.isActive = isActive;
        const [data, total] = await this.delegationRepo.findAndCount({
            where,
            relations: { module: true },
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return {
            data,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async findById(id) {
        const delegation = await this.delegationRepo.findOne({
            where: { id },
            relations: { module: true },
        });
        if (!delegation)
            throw new common_1.NotFoundException('Delegation not found');
        return delegation;
    }
    async create(dto) {
        if (dto.fromUserId === dto.toUserId) {
            throw new common_1.BadRequestException('Cannot delegate to self');
        }
        if (dto.startDate &&
            dto.endDate &&
            new Date(dto.startDate) > new Date(dto.endDate)) {
            throw new common_1.BadRequestException('Start date cannot be after end date');
        }
        const fromUser = await this.userRepo.findOne({
            where: { empId: dto.fromUserId, isActive: true },
        });
        if (!fromUser)
            throw new common_1.BadRequestException('Source user not found or inactive');
        const toUser = await this.userRepo.findOne({
            where: { empId: dto.toUserId, isActive: true },
        });
        if (!toUser)
            throw new common_1.BadRequestException('Target user not found or inactive');
        if (dto.startDate && dto.endDate) {
            const overlapping = await this.delegationRepo.findOne({
                where: {
                    fromUserId: dto.fromUserId,
                    isActive: true,
                    startDate: (0, typeorm_2.LessThanOrEqual)(new Date(dto.endDate)),
                    endDate: (0, typeorm_2.MoreThanOrEqual)(new Date(dto.startDate)),
                },
            });
            if (overlapping) {
                throw new common_1.BadRequestException('Overlapping active delegation exists for this period');
            }
        }
        const delegation = this.delegationRepo.create({
            fromUserId: dto.fromUserId,
            toUserId: dto.toUserId,
            moduleId: dto.moduleId,
            startDate: dto.startDate ? new Date(dto.startDate) : null,
            endDate: dto.endDate ? new Date(dto.endDate) : null,
            reason: dto.reason,
            isActive: true,
        });
        const saved = await this.delegationRepo.save(delegation);
        this.notifService
            .sendToUser(dto.fromUserId, 'Delegation Created', `Your approvals have been delegated to ${dto.toUserId}${dto.reason ? `: ${dto.reason}` : ''}`, 'DELEGATION', String(saved.id), 'DELEGATION', 'HIGH')
            .catch(() => { });
        this.notifService
            .sendToUser(dto.toUserId, 'Delegation Received', `You have been delegated to handle approvals for ${dto.fromUserId}`, 'DELEGATION', String(saved.id), 'DELEGATION', 'HIGH')
            .catch(() => { });
        return saved;
    }
    async update(id, dto) {
        const delegation = await this.findById(id);
        if (dto.toUserId && delegation.fromUserId === dto.toUserId) {
            throw new common_1.BadRequestException('Cannot delegate to self');
        }
        if (dto.toUserId) {
            const toUser = await this.userRepo.findOne({
                where: { empId: dto.toUserId, isActive: true },
            });
            if (!toUser)
                throw new common_1.BadRequestException('Target user not found or inactive');
        }
        const startDate = dto.startDate
            ? new Date(dto.startDate)
            : delegation.startDate;
        const endDate = dto.endDate ? new Date(dto.endDate) : delegation.endDate;
        if (startDate && endDate && startDate > endDate) {
            throw new common_1.BadRequestException('Start date cannot be after end date');
        }
        Object.assign(delegation, {
            toUserId: dto.toUserId ?? delegation.toUserId,
            moduleId: dto.moduleId ?? delegation.moduleId,
            startDate: dto.startDate ? new Date(dto.startDate) : delegation.startDate,
            endDate: dto.endDate ? new Date(dto.endDate) : delegation.endDate,
            reason: dto.reason ?? delegation.reason,
            isActive: dto.isActive ?? delegation.isActive,
        });
        return this.delegationRepo.save(delegation);
    }
    async remove(id) {
        const delegation = await this.findById(id);
        delegation.deletedAt = new Date();
        await this.delegationRepo.save(delegation);
    }
};
exports.DelegationService = DelegationService;
exports.DelegationService = DelegationService = DelegationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_delegation_entity_1.UserDelegation)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        notification_service_1.NotificationService])
], DelegationService);
//# sourceMappingURL=delegation.service.js.map