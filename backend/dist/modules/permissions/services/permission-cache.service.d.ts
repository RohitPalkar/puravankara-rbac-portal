export declare class PermissionCacheService {
    private readonly logger;
    private readonly memoryCache;
    private readonly DEFAULT_TTL_MS;
    private redis;
    private redisAvailable;
    constructor();
    get<T>(key: string): Promise<T | null>;
    set(key: string, data: unknown, ttlMs?: number): Promise<void>;
    invalidate(key: string): Promise<void>;
    invalidateByPattern(pattern: string): Promise<void>;
    getCacheKey(userId: string, projectId: number): string;
}
