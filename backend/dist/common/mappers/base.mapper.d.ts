export declare abstract class BaseMapper<TEntity, TResponse> {
    abstract toResponse(entity: TEntity): TResponse;
    toResponseList(entities: TEntity[]): TResponse[];
}
