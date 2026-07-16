"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var UserService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserReportingLineService = exports.UserRoleService = exports.UserService = void 0;
const bcrypt = __importStar(require("bcrypt"));
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../entities/user.entity");
const user_role_entity_1 = require("../entities/user-role.entity");
const user_zone_entity_1 = require("../entities/user-zone.entity");
const user_reporting_line_entity_1 = require("../entities/user-reporting-line.entity");
const user_auth_entity_1 = require("../../auth/entities/user-auth.entity");
const permission_compiler_service_1 = require("../../permissions/services/permission-compiler.service");
const notification_service_1 = require("../../notifications/services/notification.service");
let UserService = UserService_1 = class UserService {
    repository;
    userRoleRepository;
    userZoneRepository;
    reportingLineRepository;
    userAuthRepository;
    dataSource;
    logger = new common_1.Logger(UserService_1.name);
    constructor(repository, userRoleRepository, userZoneRepository, reportingLineRepository, userAuthRepository, dataSource) {
        this.repository = repository;
        this.userRoleRepository = userRoleRepository;
        this.userZoneRepository = userZoneRepository;
        this.reportingLineRepository = reportingLineRepository;
        this.userAuthRepository = userAuthRepository;
        this.dataSource = dataSource;
    }
    async findAll(query) {
        const { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'DESC', } = query;
        const where = { deletedAt: null };
        if (search) {
            where.name = { $ilike: `%${search}%` };
        }
        const [data, total] = await this.repository.findAndCount({
            where,
            order: { [sortBy]: sortOrder },
            skip: (page - 1) * limit,
            take: limit,
            relations: { department: true },
        });
        return {
            data,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async findById(id) {
        const user = await this.repository.findOne({
            where: { empId: id },
            relations: { department: true },
        });
        if (!user || user.deletedAt)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async create(dto) {
        const existing = await this.repository.findOne({
            where: { email: dto.email },
        });
        if (existing)
            throw new common_1.ConflictException('Email already in use');
        const empId = await this.generateEmpId();
        const user = this.repository.create({
            empId,
            name: dto.name,
            email: dto.email,
            departmentId: dto.departmentId,
            employmentStatus: dto.employmentStatus || 'PERMANENT',
            isActive: dto.isActive ?? true,
        });
        const savedUser = await this.repository.save(user);
        const generatedPassword = this.generateRandomPassword();
        const passwordHash = await bcrypt.hash(generatedPassword, 12);
        await this.userAuthRepository.save(this.userAuthRepository.create({
            userId: savedUser.empId,
            passwordHash,
            authProvider: 'LOCAL',
        }));
        return { user: savedUser, generatedPassword };
    }
    generateRandomPassword(length = 12) {
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const digits = '0123456789';
        const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        const all = uppercase + lowercase + digits + special;
        const required = [
            uppercase[Math.floor(Math.random() * uppercase.length)],
            lowercase[Math.floor(Math.random() * lowercase.length)],
            digits[Math.floor(Math.random() * digits.length)],
            special[Math.floor(Math.random() * special.length)],
        ];
        for (let i = required.length; i < length; i++) {
            required.push(all[Math.floor(Math.random() * all.length)]);
        }
        for (let i = required.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [required[i], required[j]] = [required[j], required[i]];
        }
        return required.join('');
    }
    async update(id, dto) {
        const user = await this.findById(id);
        if (dto.email && dto.email !== user.email) {
            const existing = await this.repository.findOne({
                where: { email: dto.email },
            });
            if (existing)
                throw new common_1.ConflictException('Email already in use');
        }
        Object.assign(user, dto);
        return this.repository.save(user);
    }
    async remove(id) {
        const user = await this.findById(id);
        user.deletedAt = new Date();
        await this.repository.save(user);
    }
    async createFull(dto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const existing = await queryRunner.manager.findOne(user_entity_1.User, {
                where: { email: dto.basic.email },
            });
            if (existing)
                throw new common_1.ConflictException('Email already in use');
            const empId = await this.generateEmpId();
            const user = queryRunner.manager.create(user_entity_1.User, {
                empId,
                name: dto.basic.name,
                email: dto.basic.email,
                departmentId: dto.basic.departmentId,
                employmentStatus: dto.basic.employmentStatus || 'PERMANENT',
                isActive: dto.basic.isActive ?? true,
            });
            const savedUser = await queryRunner.manager.save(user);
            const roles = [];
            const primaryRole = queryRunner.manager.create(user_role_entity_1.UserRole, {
                userId: savedUser.empId,
                departmentId: dto.basic.departmentId,
                roleId: dto.organization.primaryRole,
                assignedBy: 'SYSTEM',
                assignedAt: new Date(),
            });
            roles.push(await queryRunner.manager.save(primaryRole));
            if (dto.organization.secondaryRoles?.length) {
                for (const roleId of dto.organization.secondaryRoles) {
                    const sr = queryRunner.manager.create(user_role_entity_1.UserRole, {
                        userId: savedUser.empId,
                        departmentId: dto.basic.departmentId,
                        roleId,
                        assignedBy: 'SYSTEM',
                        assignedAt: new Date(),
                    });
                    roles.push(await queryRunner.manager.save(sr));
                }
            }
            const zones = [];
            if (dto.organization.zones?.length) {
                for (const zoneId of dto.organization.zones) {
                    const uz = queryRunner.manager.create(user_zone_entity_1.UserZone, {
                        userId: savedUser.empId,
                        zoneId,
                        assignedAt: new Date(),
                    });
                    zones.push(await queryRunner.manager.save(uz));
                }
            }
            const reportingLines = [];
            if (dto.organization.reporting?.length) {
                for (const entry of dto.organization.reporting) {
                    const rl = queryRunner.manager.create(user_reporting_line_entity_1.UserReportingLine, {
                        userId: savedUser.empId,
                        reportsToUserId: entry.managerId,
                        levelRank: entry.levelRank,
                        effectiveFrom: new Date(),
                    });
                    reportingLines.push(await queryRunner.manager.save(rl));
                }
            }
            await queryRunner.commitTransaction();
            return { user: savedUser, roles, zones, reportingLines };
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`User creation transaction failed: ${err.message}`);
            if (err instanceof common_1.ConflictException || err instanceof common_1.BadRequestException) {
                throw err;
            }
            throw new common_1.BadRequestException('User creation failed. All changes rolled back.');
        }
        finally {
            await queryRunner.release();
        }
    }
    async generateEmpId() {
        const [lastUser] = await this.repository.find({
            order: { createdAt: 'DESC' },
            take: 1,
        });
        const lastNum = lastUser
            ? parseInt(lastUser.empId.replace('PPL', ''), 10)
            : 0;
        const nextNum = lastNum + 1;
        return `PPL${String(nextNum).padStart(5, '0')}`;
    }
};
exports.UserService = UserService;
exports.UserService = UserService = UserService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(user_role_entity_1.UserRole)),
    __param(2, (0, typeorm_1.InjectRepository)(user_zone_entity_1.UserZone)),
    __param(3, (0, typeorm_1.InjectRepository)(user_reporting_line_entity_1.UserReportingLine)),
    __param(4, (0, typeorm_1.InjectRepository)(user_auth_entity_1.UserAuth)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], UserService);
let UserRoleService = class UserRoleService {
    repository;
    notifService;
    compilerService;
    constructor(repository, notifService, compilerService) {
        this.repository = repository;
        this.notifService = notifService;
        this.compilerService = compilerService;
    }
    async findByUser(userId) {
        return this.repository.find({
            where: { userId },
            relations: { role: true, department: true },
        });
    }
    async assign(dto) {
        const existing = await this.repository.findOne({
            where: {
                userId: dto.userId,
                departmentId: dto.departmentId,
                roleId: dto.roleId,
            },
        });
        if (existing)
            throw new common_1.ConflictException('User already has this role in this department');
        const ur = this.repository.create({
            userId: dto.userId,
            departmentId: dto.departmentId,
            roleId: dto.roleId,
            assignedBy: dto.assignedBy,
            assignedAt: new Date(),
        });
        const saved = await this.repository.save(ur);
        this.notifService
            .sendToUser(dto.userId, 'Role Assigned', `You have been assigned a new role in department ${dto.departmentId}`, 'ROLE_ASSIGNMENT', String(dto.roleId), 'ROLE', 'HIGH')
            .catch(() => { });
        this.compilerService.compileForAllUserProjects(dto.userId).catch(() => { });
        return saved;
    }
    async revoke(userId, departmentId, roleId) {
        const result = await this.repository.delete({
            userId,
            departmentId,
            roleId,
        });
        if (result.affected === 0)
            throw new common_1.NotFoundException('User role assignment not found');
        this.compilerService.compileForAllUserProjects(userId).catch(() => { });
    }
};
exports.UserRoleService = UserRoleService;
exports.UserRoleService = UserRoleService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_role_entity_1.UserRole)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        notification_service_1.NotificationService,
        permission_compiler_service_1.PermissionCompilerService])
], UserRoleService);
let UserReportingLineService = class UserReportingLineService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async findByUser(userId) {
        return this.repository.find({
            where: { userId },
            relations: { reportsTo: true },
        });
    }
    async create(dto) {
        const rl = this.repository.create({
            userId: dto.userId,
            reportsToUserId: dto.reportsToUserId,
            levelRank: dto.levelRank,
            effectiveFrom: dto.effectiveFrom
                ? new Date(dto.effectiveFrom)
                : undefined,
            effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : undefined,
        });
        return this.repository.save(rl);
    }
    async remove(userId, reportsToUserId, levelRank) {
        const result = await this.repository.delete({
            userId,
            reportsToUserId,
            levelRank,
        });
        if (result.affected === 0)
            throw new common_1.NotFoundException('Reporting line not found');
    }
};
exports.UserReportingLineService = UserReportingLineService;
exports.UserReportingLineService = UserReportingLineService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_reporting_line_entity_1.UserReportingLine)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UserReportingLineService);
//# sourceMappingURL=user.service.js.map