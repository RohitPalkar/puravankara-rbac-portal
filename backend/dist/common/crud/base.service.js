"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseService = void 0;
const typeorm_1 = require("typeorm");
const common_1 = require("@nestjs/common");
class BaseService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async findAll(query, searchableFields = [], defaultSort = 'createdAt') {
        const { page = 1, limit = 20, search, sortBy = defaultSort, sortOrder = 'DESC', ...filters } = query;
        const where = { deletedAt: null };
        if (search && searchableFields.length > 0) {
            const searchConditions = searchableFields.map((field) => ({
                [field]: (0, typeorm_1.ILike)(`%${search}%`),
                ...where,
            }));
            delete where.deletedAt;
            for (const [key, value] of Object.entries(filters)) {
                if (value !== undefined && value !== '' && value !== null) {
                    searchConditions.forEach((cond) => {
                        cond[key] = value;
                    });
                }
            }
            const [data, total] = await this.repository.findAndCount({
                where: searchConditions,
                order: { [sortBy]: sortOrder },
                skip: (page - 1) * limit,
                take: limit,
            });
            return {
                data,
                meta: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
        }
        for (const [key, value] of Object.entries(filters)) {
            if (value !== undefined && value !== '' && value !== null) {
                where[key] = value;
            }
        }
        const [data, total] = await this.repository.findAndCount({
            where,
            order: { [sortBy]: sortOrder },
            skip: (page - 1) * limit,
            take: limit,
        });
        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findById(id) {
        const entity = await this.repository.findOne({
            where: { id },
        });
        if (!entity || entity.deletedAt) {
            throw new common_1.NotFoundException('Resource not found');
        }
        return entity;
    }
    async create(dto) {
        const entity = this.repository.create(dto);
        return this.repository.save(entity);
    }
    async update(id, dto) {
        const entity = await this.findById(id);
        Object.assign(entity, dto);
        return this.repository.save(entity);
    }
    async remove(id) {
        const entity = await this.findById(id);
        entity.deletedAt = new Date();
        await this.repository.save(entity);
    }
}
exports.BaseService = BaseService;
//# sourceMappingURL=base.service.js.map