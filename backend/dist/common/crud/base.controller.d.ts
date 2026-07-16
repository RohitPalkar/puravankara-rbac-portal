import { BaseService } from './base.service';
import { PaginationQueryDto } from '../dto/pagination-query.dto';
export declare abstract class BaseController<TEntity extends {
    id: number | string;
    deletedAt?: Date;
}, TCreateDto, TUpdateDto> {
    protected readonly service: BaseService<TEntity>;
    protected readonly entityName: string;
    constructor(service: BaseService<TEntity>, entityName?: string);
    findAll(query: PaginationQueryDto): Promise<import("./crud.interface").PaginatedResult<TEntity>>;
    findById(id: number): Promise<TEntity>;
    create(dto: TCreateDto): Promise<TEntity>;
    update(id: number, dto: TUpdateDto): Promise<TEntity>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
