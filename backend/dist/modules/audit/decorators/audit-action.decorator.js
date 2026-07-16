"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditAction = exports.AUDIT_ACTION_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.AUDIT_ACTION_KEY = 'auditAction';
const AuditAction = (options) => (0, common_1.SetMetadata)(exports.AUDIT_ACTION_KEY, options);
exports.AuditAction = AuditAction;
//# sourceMappingURL=audit-action.decorator.js.map