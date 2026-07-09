import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

export function mockRepository<T>(
  entity: new (...args: any[]) => T,
): Partial<Record<keyof Repository<T>, jest.Mock>> {
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    findOneOrFail: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
}

export function mockRepoProvider<T>(entity: new (...args: any[]) => T) {
  return {
    provide: getRepositoryToken(entity),
    useValue: mockRepository(entity),
  };
}
