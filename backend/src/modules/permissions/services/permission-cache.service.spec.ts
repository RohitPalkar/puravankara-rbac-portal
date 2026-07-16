import { Test, TestingModule } from '@nestjs/testing';
import { PermissionCacheService } from './permission-cache.service';

describe('PermissionCacheService', () => {
  let service: PermissionCacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PermissionCacheService],
    }).compile();

    service = module.get<PermissionCacheService>(PermissionCacheService);
    service['redisAvailable'] = false; // force memory mode for tests
  });

  afterEach(() => {
    service['memoryCache'].clear();
  });

  describe('get/set', () => {
    it('should store and retrieve values from memory cache', async () => {
      const data = { allowed: true, source: 'role' };

      await service.set('test-key', data);
      const result = await service.get('test-key');

      expect(result).toEqual(data);
    });

    it('should return null for missing key', async () => {
      const result = await service.get('nonexistent');
      expect(result).toBeNull();
    });

    it('should respect TTL expiry', async () => {
      await service.set('expire-key', 'data', -1);

      const result = await service.get('expire-key');
      expect(result).toBeNull();
    });
  });

  describe('invalidate', () => {
    it('should remove a key from memory cache', async () => {
      await service.set('key1', 'value1');
      await service.invalidate('key1');

      const result = await service.get('key1');
      expect(result).toBeNull();
    });
  });

  describe('invalidateByPattern', () => {
    it('should remove keys matching pattern', async () => {
      await service.set('permission:user1:1', 'data');
      await service.set('permission:user1:2', 'data');
      await service.set('other:key', 'data');

      await service.invalidateByPattern('permission:user1:*');

      expect(await service.get('permission:user1:1')).toBeNull();
      expect(await service.get('permission:user1:2')).toBeNull();
      expect(await service.get('other:key')).toEqual('data');
    });
  });

  describe('getCacheKey', () => {
    it('should return formatted cache key', () => {
      expect(service.getCacheKey('PPL00001', 5)).toBe('permission:PPL00001:5');
    });
  });
});
