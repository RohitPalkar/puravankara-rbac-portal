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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var PermissionCacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionCacheService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = __importDefault(require("ioredis"));
let PermissionCacheService = PermissionCacheService_1 = class PermissionCacheService {
    logger = new common_1.Logger(PermissionCacheService_1.name);
    memoryCache = new Map();
    DEFAULT_TTL_MS = 5 * 60 * 1000;
    redis = null;
    redisAvailable = false;
    constructor() {
        const host = process.env.REDIS_HOST || 'localhost';
        const port = Number(process.env.REDIS_PORT) || 6379;
        if (process.env.REDIS_ENABLED === 'true') {
            try {
                this.redis = new ioredis_1.default({ host, port, lazyConnect: true });
                this.redis
                    .connect()
                    .then(() => {
                    this.redisAvailable = true;
                    this.logger.log(`Redis connected at ${host}:${port}`);
                })
                    .catch((err) => {
                    this.logger.warn(`Redis unavailable, using memory cache: ${err.message}`);
                    this.redisAvailable = false;
                });
            }
            catch (err) {
                this.logger.warn(`Redis connection failed, using memory cache: ${err.message}`);
            }
        }
    }
    async get(key) {
        if (this.redisAvailable && this.redis) {
            try {
                const raw = await this.redis.get(key);
                if (raw)
                    return JSON.parse(raw);
                return null;
            }
            catch {
                this.logger.warn('Redis get failed, falling back to memory');
            }
        }
        const entry = this.memoryCache.get(key);
        if (!entry)
            return null;
        if (Date.now() > entry.expiry) {
            this.memoryCache.delete(key);
            return null;
        }
        return entry.data;
    }
    async set(key, data, ttlMs) {
        const ttl = ttlMs ?? this.DEFAULT_TTL_MS;
        if (this.redisAvailable && this.redis) {
            try {
                await this.redis.setex(key, Math.ceil(ttl / 1000), JSON.stringify(data));
                return;
            }
            catch {
                this.logger.warn('Redis set failed, falling back to memory');
            }
        }
        this.memoryCache.set(key, { data, expiry: Date.now() + ttl });
    }
    async invalidate(key) {
        if (this.redisAvailable && this.redis) {
            try {
                await this.redis.del(key);
            }
            catch {
            }
        }
        this.memoryCache.delete(key);
    }
    async invalidateByPattern(pattern) {
        if (this.redisAvailable && this.redis) {
            try {
                const keys = await this.redis.keys(pattern);
                if (keys.length > 0)
                    await this.redis.del(...keys);
            }
            catch {
            }
        }
        const regex = new RegExp(pattern.replace('*', '.*'));
        for (const key of this.memoryCache.keys()) {
            if (regex.test(key)) {
                this.memoryCache.delete(key);
            }
        }
    }
    getCacheKey(userId, projectId) {
        return `permission:${userId}:${projectId}`;
    }
};
exports.PermissionCacheService = PermissionCacheService;
exports.PermissionCacheService = PermissionCacheService = PermissionCacheService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PermissionCacheService);
//# sourceMappingURL=permission-cache.service.js.map