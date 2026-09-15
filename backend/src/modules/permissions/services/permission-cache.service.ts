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
    const password = process.env.REDIS_PASSWORD || undefined;

    if (process.env.REDIS_ENABLED === 'true') {
      try {
        this.redis = new Redis({
          host,
          port,
          password,
          lazyConnect: true,
          maxRetriesPerRequest: 2,
          enableReadyCheck: true,
        });
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

        this.redis.on('error', (err) => {
          this.logger.warn(`Redis error: ${err.message}`);
          this.redisAvailable = false;
        });
        this.redis.on('close', () => {
          this.redisAvailable = false;
        });

        // Sweeper for memory cache to prevent unbounded growth
        setInterval(() => {
          const now = Date.now();
          for (const [k, v] of this.memoryCache.entries()) {
            if (now > v.expiry) this.memoryCache.delete(k);
          }
          // Cap at 1000 entries LRU-ish: delete oldest if over
          if (this.memoryCache.size > 1000) {
            const firstKey = this.memoryCache.keys().next().value;
            if (firstKey) this.memoryCache.delete(firstKey);
          }
        }, 60_000).unref();
      } catch (err) {
        this.logger.warn(
          `Redis connection failed, using memory cache: ${(err as Error).message}`,
        );
      }
    } else {
      // Even for memory-only, sweep expired entries
      setInterval(() => {
        const now = Date.now();
        for (const [k, v] of this.memoryCache.entries()) {
          if (now > v.expiry) this.memoryCache.delete(k);
        }
        if (this.memoryCache.size > 1000) {
          const firstKey = this.memoryCache.keys().next().value;
          if (firstKey) this.memoryCache.delete(firstKey);
        }
      }, 60_000).unref();
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
        const stream = this.redis.scanStream({ match: pattern, count: 100 });
        const keysToDel: string[] = [];
        for await (const keys of stream) {
          if (keys.length) keysToDel.push(...keys);
          if (keysToDel.length >= 500) {
            await this.redis.del(...keysToDel.splice(0, 500));
          }
        }
        if (keysToDel.length) await this.redis.del(...keysToDel);
      } catch {
        /* ignore */
      }
    }

    const regex = new RegExp(
      '^' + pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\*/g, '.*') + '$',
    );
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
