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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const notification_entity_1 = require("./entities/notification.entity");
const notification_preference_entity_1 = require("./entities/notification-preference.entity");
const notification_service_1 = require("./services/notification.service");
const notification_controller_1 = require("./controllers/notification.controller");
const notification_gateway_1 = require("./notification.gateway");
const audit_module_1 = require("../audit/audit.module");
let NotificationsModule = class NotificationsModule {
    notifService;
    notifGateway;
    constructor(notifService, notifGateway) {
        this.notifService = notifService;
        this.notifGateway = notifGateway;
    }
    onModuleInit() {
        this.notifService.setOnNotification((notification) => {
            this.notifGateway.sendToUser(notification.userId, 'notification.created', notification);
            this.notifGateway.sendToUser(notification.userId, 'notification.unread_count', { unreadCount: 1 });
        });
    }
};
exports.NotificationsModule = NotificationsModule;
exports.NotificationsModule = NotificationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([notification_entity_1.Notification, notification_preference_entity_1.NotificationPreference]),
            audit_module_1.AuditModule,
        ],
        controllers: [notification_controller_1.NotificationController],
        providers: [notification_service_1.NotificationService, notification_gateway_1.NotificationGateway],
        exports: [notification_service_1.NotificationService, typeorm_1.TypeOrmModule],
    }),
    __metadata("design:paramtypes", [notification_service_1.NotificationService,
        notification_gateway_1.NotificationGateway])
], NotificationsModule);
//# sourceMappingURL=notifications.module.js.map