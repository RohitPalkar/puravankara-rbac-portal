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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_entity_1 = require("../entities/notification.entity");
const notification_preference_entity_1 = require("../entities/notification-preference.entity");
const audit_service_1 = require("../../audit/services/audit.service");
let NotificationService = NotificationService_1 = class NotificationService {
    notifRepo;
    prefRepo;
    auditService;
    logger = new common_1.Logger(NotificationService_1.name);
    channels = [];
    onNotification = null;
    constructor(notifRepo, prefRepo, auditService) {
        this.notifRepo = notifRepo;
        this.prefRepo = prefRepo;
        this.auditService = auditService;
    }
    setOnNotification(cb) {
        this.onNotification = cb;
    }
    addChannel(channel) {
        this.channels.push(channel);
    }
    async create(dto) {
        const notif = this.notifRepo.create({
            userId: dto.userId,
            title: dto.title,
            message: dto.message,
            notificationType: dto.notificationType,
            priority: dto.priority || 'NORMAL',
            referenceType: dto.referenceType,
            referenceId: dto.referenceId,
            metadata: dto.metadata || null,
            isRead: false,
        });
        const saved = await this.notifRepo.save(notif);
        this.auditService
            .createLog({
            entityName: 'NOTIFICATION',
            action: 'CREATED',
            entityId: String(saved.id),
            newValue: { userId: dto.userId, type: dto.notificationType },
            performedBy: dto.userId,
            source: 'NOTIFICATION',
        })
            .catch(() => { });
        this.onNotification?.(saved);
        const pref = await this.prefRepo.findOne({ where: { userId: dto.userId } });
        if (!pref || pref.inAppEnabled) {
            for (const channel of this.channels) {
                channel
                    .send(dto.userId, saved)
                    .catch((err) => this.logger.error(`Channel send failed: ${err.message}`));
            }
        }
        return saved;
    }
    async sendToUser(userId, title, message, referenceType, referenceId, notificationType, priority, metadata) {
        return this.create({
            userId,
            title,
            message,
            notificationType,
            priority,
            referenceType,
            referenceId,
            metadata,
        });
    }
    async sendToUsers(userIds, title, message, referenceType, referenceId) {
        return Promise.all(userIds.map((uid) => this.sendToUser(uid, title, message, referenceType, referenceId)));
    }
    async findMyNotifications(userId, query) {
        const { unreadOnly, type, priority, page = 1, limit = 20 } = query;
        const where = { userId };
        if (unreadOnly)
            where.isRead = false;
        if (type)
            where.notificationType = type;
        if (priority)
            where.priority = priority;
        const [data, total] = await this.notifRepo.findAndCount({
            where,
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return {
            data,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async markAsRead(notificationId, userId) {
        const notif = await this.notifRepo.findOne({
            where: { id: notificationId, userId },
        });
        if (!notif)
            return null;
        notif.isRead = true;
        notif.readAt = new Date();
        const saved = await this.notifRepo.save(notif);
        this.auditService
            .createLog({
            entityName: 'NOTIFICATION',
            action: 'READ',
            entityId: String(saved.id),
            performedBy: userId,
            source: 'NOTIFICATION',
        })
            .catch(() => { });
        return saved;
    }
    async markAllAsRead(userId) {
        await this.notifRepo.update({ userId, isRead: false }, { isRead: true, readAt: new Date() });
        this.auditService
            .createLog({
            entityName: 'NOTIFICATION',
            action: 'READ_ALL',
            entityId: userId,
            performedBy: userId,
            source: 'NOTIFICATION',
        })
            .catch(() => { });
    }
    async getUnreadCount(userId) {
        return this.notifRepo.count({ where: { userId, isRead: false } });
    }
    async getPreferences(userId) {
        let pref = await this.prefRepo.findOne({ where: { userId } });
        if (!pref) {
            pref = this.prefRepo.create({ userId });
            pref = await this.prefRepo.save(pref);
        }
        return pref;
    }
    async updatePreferences(userId, updates) {
        let pref = await this.prefRepo.findOne({ where: { userId } });
        if (!pref) {
            pref = this.prefRepo.create({ userId });
        }
        Object.assign(pref, updates);
        const saved = await this.prefRepo.save(pref);
        this.auditService
            .createLog({
            entityName: 'NOTIFICATION_PREFERENCE',
            action: 'UPDATED',
            entityId: userId,
            newValue: updates,
            performedBy: userId,
            source: 'NOTIFICATION',
        })
            .catch(() => { });
        return saved;
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __param(1, (0, typeorm_1.InjectRepository)(notification_preference_entity_1.NotificationPreference)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        audit_service_1.AuditService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map