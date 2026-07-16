export abstract class BaseMapper<TEntity, TResponse> {
  abstract toResponse(entity: TEntity): TResponse;

  toResponseList(entities: TEntity[]): TResponse[] {
    return entities.map((e) => this.toResponse(e));
  }
}
