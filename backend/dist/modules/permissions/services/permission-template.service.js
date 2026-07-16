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
exports.PermissionTemplateService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const permission_template_entity_1 = require("../entities/permission-template.entity");
const template_permission_entity_1 = require("../entities/template-permission.entity");
let PermissionTemplateService = class PermissionTemplateService {
    repo;
    tpRepo;
    constructor(repo, tpRepo) {
        this.repo = repo;
        this.tpRepo = tpRepo;
    }
    async findAll() {
        return this.repo.find({ order: { createdAt: 'DESC' } });
    }
    async findById(id) {
        const tmpl = await this.repo.findOne({ where: { id } });
        if (!tmpl)
            throw new common_1.NotFoundException('Template not found');
        return tmpl;
    }
    async create(dto) {
        const existing = await this.repo.findOne({ where: { name: dto.name } });
        if (existing)
            throw new common_1.ConflictException('Template name already exists');
        const tmpl = this.repo.create({
            name: dto.name,
            description: dto.description,
        });
        return this.repo.save(tmpl);
    }
    async update(id, dto) {
        const tmpl = await this.findById(id);
        if (dto.name && dto.name !== tmpl.name) {
            const existing = await this.repo.findOne({ where: { name: dto.name } });
            if (existing)
                throw new common_1.ConflictException('Template name already exists');
        }
        Object.assign(tmpl, dto);
        return this.repo.save(tmpl);
    }
    async remove(id) {
        const tmpl = await this.findById(id);
        await this.tpRepo.delete({ templateId: id });
        await this.repo.remove(tmpl);
    }
    async getPermissions(templateId) {
        return this.tpRepo.find({
            where: { templateId },
            relations: { module: true, subModule: true, action: true },
        });
    }
    async setPermissions(templateId, permissions) {
        await this.tpRepo.delete({ templateId });
        if (permissions.length === 0)
            return [];
        const entities = permissions.map((p) => this.tpRepo.create({
            templateId,
            moduleId: p.moduleId,
            subModuleId: p.subModuleId ?? null,
            actionId: p.actionId,
        }));
        return this.tpRepo.save(entities);
    }
};
exports.PermissionTemplateService = PermissionTemplateService;
exports.PermissionTemplateService = PermissionTemplateService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(permission_template_entity_1.PermissionTemplate)),
    __param(1, (0, typeorm_1.InjectRepository)(template_permission_entity_1.TemplatePermission)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], PermissionTemplateService);
//# sourceMappingURL=permission-template.service.js.map