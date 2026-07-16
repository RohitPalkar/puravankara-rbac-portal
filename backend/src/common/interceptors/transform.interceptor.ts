import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  meta?: any;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((res) => {
        if (res && res.__raw) return res.data;
        return {
          statusCode: context.switchToHttp().getResponse().statusCode,
          message: res?.message || 'Success',
          data: res?.data ?? res ?? null,
          meta: res?.meta ?? undefined,
        };
      }),
    );
  }
}
