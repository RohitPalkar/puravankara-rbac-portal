"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuditInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditInterceptor = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const operators_1 = require("rxjs/operators");
const audit_service_1 = require("../services/audit.service");
const audit_action_decorator_1 = require("../decorators/audit-action.decorator");
let AuditInterceptor = AuditInterceptor_1 = class AuditInterceptor {
    reflector;
    auditService;
    logger = new common_1.Logger(AuditInterceptor_1.name);
    constructor(reflector, auditService) {
        this.reflector = reflector;
        this.auditService = auditService;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const method = request.method;
        const auditMeta = this.reflector.getAllAndOverride(audit_action_decorator_1.AUDIT_ACTION_KEY, [context.getHandler(), context.getClass()]);
        const isWriteMethod = ['POST', 'PATCH', 'DELETE'].includes(method);
        if (!auditMeta && !isWriteMethod) {
            return next.handle();
        }
        const entityName = auditMeta?.entity || this.inferEntityName(request.url);
        const action = auditMeta?.action || this.inferAction(method);
        const performedBy = request.user?.empId || request.user?.userId;
        const ipAddress = request.ip;
        const userAgent = request.headers?.['user-agent'];
        return next.handle().pipe((0, operators_1.tap)({
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
                    .catch((err) => this.logger.error('Failed to write audit log', err));
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
                    .catch((err) => this.logger.error('Failed to write audit log', err));
            },
        }));
    }
    inferEntityName(url) {
        const match = url.match(/\/api\/v1\/([^\/?]+)/);
        return match ? match[1].replace(/-/g, '_').toUpperCase() : 'UNKNOWN';
    }
    inferAction(method) {
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
    extractEntityId(request, response) {
        const paramId = request.params?.id ||
            request.params?.requestId ||
            request.params?.userId ||
            request.params?.workflowId;
        if (paramId)
            return String(paramId);
        if (response?.id)
            return String(response.id);
        if (response?.data?.id)
            return String(response.data.id);
        return undefined;
    }
};
exports.AuditInterceptor = AuditInterceptor;
exports.AuditInterceptor = AuditInterceptor = AuditInterceptor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        audit_service_1.AuditService])
], AuditInterceptor);
//# sourceMappingURL=audit.interceptor.js.map