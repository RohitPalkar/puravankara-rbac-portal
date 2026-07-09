import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationService } from './notification.service';
import { Notification } from '../entities/notification.entity';
import { NotificationPreference } from '../entities/notification-preference.entity';
import { AuditService } from '../../audit/services/audit.service';
import { CreateNotificationDto } from '../dto/create-notification.dto';

describe('NotificationService', () => {
  let service: NotificationService;
  let notifRepo: jest.Mocked<Repository<Notification>>;
  let prefRepo: jest.Mocked<Repository<NotificationPreference>>;
  let auditService: jest.Mocked<AuditService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: getRepositoryToken(Notification),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(NotificationPreference),
          useValue: { findOne: jest.fn(), create: jest.fn(), save: jest.fn() },
        },
        {
          provide: AuditService,
          useValue: { createLog: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    notifRepo = module.get(getRepositoryToken(Notification));
    prefRepo = module.get(getRepositoryToken(NotificationPreference));
    auditService = module.get(AuditService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const dto: CreateNotificationDto = {
      userId: 'PPL00002',
      title: 'Test Notification',
      message: 'Test message',
      notificationType: 'INFO',
      priority: 'NORMAL',
      referenceType: 'PROJECT',
      referenceId: '10',
    };

    it('should create notification and log audit', async () => {
      const savedNotif = { id: 1, ...dto, isRead: false } as Notification;
      notifRepo.create.mockReturnValue(savedNotif);
      notifRepo.save.mockResolvedValue(savedNotif);
      prefRepo.findOne.mockResolvedValue({
        inAppEnabled: true,
      } as NotificationPreference);

      const result = await service.create(dto);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(auditService.createLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'CREATED',
          entityName: 'NOTIFICATION',
        }),
      );
    });

    it('should default priority to NORMAL', async () => {
      const savedNotif = {
        id: 2,
        userId: 'PPL00002',
        title: 'No Priority',
        isRead: false,
      } as Notification;
      notifRepo.create.mockReturnValue(savedNotif);
      notifRepo.save.mockResolvedValue(savedNotif);
      prefRepo.findOne.mockResolvedValue({
        inAppEnabled: true,
      } as NotificationPreference);

      await service.create({ userId: 'PPL00002', title: 'No Priority' });

      expect(notifRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ priority: 'NORMAL' }),
      );
    });
  });

  describe('sendToUser', () => {
    it('should create a notification for a single user', async () => {
      const notif = {
        id: 3,
        userId: 'PPL00002',
        title: 'Hello',
      } as Notification;
      jest.spyOn(service, 'create').mockResolvedValue(notif);

      const result = await service.sendToUser(
        'PPL00002',
        'Hello',
        'World',
        'TEST',
        '1',
      );

      expect(service.create).toHaveBeenCalledWith({
        userId: 'PPL00002',
        title: 'Hello',
        message: 'World',
        referenceType: 'TEST',
        referenceId: '1',
        notificationType: undefined,
        priority: undefined,
        metadata: undefined,
      });
      expect(result).toEqual(notif);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const notif = {
        id: 1,
        userId: 'PPL00002',
        isRead: false,
        readAt: null,
      } as Notification;
      notifRepo.findOne.mockResolvedValue(notif);
      notifRepo.save.mockResolvedValue({
        ...notif,
        isRead: true,
        readAt: new Date(),
      });

      const result = await service.markAsRead(1, 'PPL00002');

      expect(result.isRead).toBe(true);
      expect(auditService.createLog).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'READ' }),
      );
    });

    it('should return null when notification not found', async () => {
      notifRepo.findOne.mockResolvedValue(null);

      const result = await service.markAsRead(999, 'PPL00002');

      expect(result).toBeNull();
    });
  });

  describe('markAllAsRead', () => {
    it('should update all unread notifications for user', async () => {
      notifRepo.update.mockResolvedValue({ affected: 3 } as any);

      await service.markAllAsRead('PPL00002');

      expect(notifRepo.update).toHaveBeenCalledWith(
        { userId: 'PPL00002', isRead: false },
        { isRead: true, readAt: expect.any(Date) },
      );
      expect(auditService.createLog).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'READ_ALL' }),
      );
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count', async () => {
      notifRepo.count.mockResolvedValue(5);

      const count = await service.getUnreadCount('PPL00002');

      expect(count).toBe(5);
    });
  });

  describe('findMyNotifications', () => {
    it('should return paginated notifications with filters', async () => {
      const notifications = [{ id: 1 } as Notification];
      notifRepo.findAndCount.mockResolvedValue([notifications, 1]);

      const result = await service.findMyNotifications('PPL00002', {
        unreadOnly: true,
        type: 'INFO',
      });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('preferences', () => {
    it('should auto-create preferences if not exist', async () => {
      prefRepo.findOne.mockResolvedValue(null);
      prefRepo.create.mockReturnValue({
        userId: 'PPL00002',
      } as NotificationPreference);
      prefRepo.save.mockResolvedValue({
        userId: 'PPL00002',
      } as NotificationPreference);

      const result = await service.getPreferences('PPL00002');

      expect(result).toBeDefined();
      expect(prefRepo.create).toHaveBeenCalledWith({ userId: 'PPL00002' });
    });

    it('should update preferences and audit', async () => {
      prefRepo.findOne.mockResolvedValue({
        userId: 'PPL00002',
        emailEnabled: false,
      } as NotificationPreference);
      prefRepo.save.mockResolvedValue({
        userId: 'PPL00002',
        emailEnabled: true,
      } as NotificationPreference);

      const result = await service.updatePreferences('PPL00002', {
        emailEnabled: true,
      });

      expect(result.emailEnabled).toBe(true);
      expect(auditService.createLog).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'UPDATED' }),
      );
    });
  });
});
