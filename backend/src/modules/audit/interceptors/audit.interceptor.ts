import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../services/audit.service';
import {
  AUDIT_ACTION_KEY,
  AuditActionOptions,
} from '../decorators/audit-action.decorator';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    const auditMeta = this.reflector.getAllAndOverride<AuditActionOptions>(
      AUDIT_ACTION_KEY,
      [context.getHandler(), context.getClass()],
    );

    const isWriteMethod = ['POST', 'PATCH', 'DELETE'].includes(method);
    if (!auditMeta && !isWriteMethod) {
      return next.handle();
    }

    const entityName = auditMeta?.entity || this.inferEntityName(request.url);
    const action = auditMeta?.action || this.inferAction(method);
    const performedBy = request.user?.empId || request.user?.userId;
    const ipAddress = request.ip;
    const userAgent = request.headers?.['user-agent'];

    return next.handle().pipe(
      tap({
        next: (response) => {
          const entityId = this.extractEntityId(request, response);
          const newValue = method === 'DELETE' ? null : request.body || null;

          this.auditService
            .createLog({
              entityName,
              entityId,
              action,
              newValue,
              performedBy,
              ipAddress,
              userAgent,
              source: 'API',
            })
            .catch((err) =>
              this.logger.error('Failed to write audit log', err),
            );
        },
        error: () => {
          const entityId = this.extractEntityId(request, null);
          this.auditService
            .createLog({
              entityName,
              entityId,
              action: `${action}_FAILED`,
              newValue: request.body || null,
              performedBy,
              ipAddress,
              userAgent,
              source: 'API',
            })
            .catch((err) =>
              this.logger.error('Failed to write audit log', err),
            );
        },
      }),
    );
  }

  private inferEntityName(url: string): string {
    const match = url.match(/\/api\/v1\/([^\/?]+)/);
    return match ? match[1].replace(/-/g, '_').toUpperCase() : 'UNKNOWN';
  }

  private inferAction(method: string): string {
    switch (method) {
      case 'POST':
        return 'CREATE';
      case 'PATCH':
        return 'UPDATE';
      case 'DELETE':
        return 'DELETE';
      default:
        return method;
    }
  }

  private extractEntityId(request: any, response: any): string | undefined {
    const paramId =
      request.params?.id ||
      request.params?.requestId ||
      request.params?.userId ||
      request.params?.workflowId;
    if (paramId) return String(paramId);

    if (response?.id) return String(response.id);
    if (response?.data?.id) return String(response.data.id);

    return undefined;
  }
}
