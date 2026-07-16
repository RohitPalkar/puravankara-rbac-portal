export interface PaginationQuery {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    [key: string]: any;
}
export interface PaginatedResult<T> {
    data: T[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export interface CrudService<T, CreateDto, UpdateDto, ResponseDto> {
    findAll(query: PaginationQuery): Promise<PaginatedResult<ResponseDto>>;
    findById(id: number | string): Promise<ResponseDto>;
    create(dto: CreateDto): Promise<ResponseDto>;
    update(id: number | string, dto: UpdateDto): Promise<ResponseDto>;
    remove(id: number | string): Promise<void>;
}
