export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}
export interface PaginatedMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
    meta: PaginatedMeta;
}
