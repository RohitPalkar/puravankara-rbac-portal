import { Repository } from 'typeorm';
import { PaginationQuery, PaginatedResult } from './crud.interface';
export declare abstract class BaseService<T extends {
    id: number | string;
    deletedAt?: Date | null;
}> {
    protected readonly repository: Repository<T>;
    constructor(repository: Repository<T>);
    findAll(query: PaginationQuery, searchableFields?: string[], defaultSort?: string): Promise<PaginatedResult<T>>;
    findById(id: number | string): Promise<T>;
    create(dto: Partial<T>): Promise<T>;
    update(id: number | string, dto: Partial<T>): Promise<T>;
    remove(id: number | string): Promise<void>;
}
