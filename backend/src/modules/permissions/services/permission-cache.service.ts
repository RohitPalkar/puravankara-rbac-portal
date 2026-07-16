import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';

interface CacheEntry {
  data: unknown;
  expiry: number;
}

@Injectable()
export class PermissionCacheService {
  private readonly logger = new Logger(PermissionCacheService.name);
  private readonly memoryCache = new Map<string, CacheEntry>();
  private readonly DEFAULT_TTL_MS = 5 * 60 * 1000;
  private redis: Redis | null = null;
  private redisAvailable = false;

  constructor() {
    const host = process.env.REDIS_HOST || 'localhost';
    const port = Number(process.env.REDIS_PORT) || 6379;

    if (process.env.REDIS_ENABLED === 'true') {
      try {
        this.redis = new Redis({ host, port, lazyConnect: true });
        this.redis
          .connect()
          .then(() => {
            this.redisAvailable = true;
            this.logger.log(`Redis connected at ${host}:${port}`);
          })
          .catch((err) => {
            this.logger.warn(
              `Redis unavailable, using memory cache: ${err.message}`,
            );
            this.redisAvailable = false;
          });
      } catch (err) {
        this.logger.warn(
          `Redis connection failed, using memory cache: ${err.message}`,
        );
      }
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.redisAvailable && this.redis) {
      try {
        const raw = await this.redis.get(key);
        if (raw) return JSON.parse(raw) as T;
        return null;
      } catch {
        this.logger.warn('Redis get failed, falling back to memory');
      }
    }

    const entry = this.memoryCache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.memoryCache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  async set(key: string, data: unknown, ttlMs?: number): Promise<void> {
    const ttl = ttlMs ?? this.DEFAULT_TTL_MS;

    if (this.redisAvailable && this.redis) {
      try {
        await this.redis.setex(
          key,
          Math.ceil(ttl / 1000),
          JSON.stringify(data),
        );
        return;
      } catch {
        this.logger.warn('Redis set failed, falling back to memory');
      }
    }

    this.memoryCache.set(key, { data, expiry: Date.now() + ttl });
  }

  async invalidate(key: string): Promise<void> {
    if (this.redisAvailable && this.redis) {
      try {
        await this.redis.del(key);
      } catch {
        /* ignore */
      }
    }
    this.memoryCache.delete(key);
  }

  async invalidateByPattern(pattern: string): Promise<void> {
    if (this.redisAvailable && this.redis) {
      try {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) await this.redis.del(...keys);
      } catch {
        /* ignore */
      }
    }

    const regex = new RegExp(pattern.replace('*', '.*'));
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }
  }

  getCacheKey(userId: string, projectId: number): string {
    return `permission:${userId}:${projectId}`;
  }
}
