import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('RBAC (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();

    const adminRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@puravankara.com', password: 'Admin@123' });
    adminToken = adminRes.body.data.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/permissions/me', () => {
    it('should return permissions for admin', () => {
      return request(app.getHttpServer())
        .get('/api/v1/permissions/me')
        .query({ projectId: 1 })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should return 401 without auth', () => {
      return request(app.getHttpServer())
        .get('/api/v1/permissions/me')
        .query({ projectId: 1 })
        .expect(401);
    });
  });

  describe('GET /api/v1/users', () => {
    it('should list users with pagination', () => {
      return request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          expect(res.body.meta).toBeDefined();
        });
    });
  });

  describe('GET /api/v1/geography/zones', () => {
    it('should list zones', () => {
      return request(app.getHttpServer())
        .get('/api/v1/geography/zones')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('GET /api/v1/notifications', () => {
    it('should return notifications for admin', () => {
      return request(app.getHttpServer())
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('GET /api/v1/notifications/count', () => {
    it('should return unread count', () => {
      return request(app.getHttpServer())
        .get('/api/v1/notifications/count')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.unreadCount).toBeDefined();
        });
    });
  });

  describe('POST /api/v1/permissions/explain', () => {
    it('should explain permission resolution', () => {
      return request(app.getHttpServer())
        .post('/api/v1/permissions/explain')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: 'PPL00001',
          projectId: 1,
          moduleCode: 'PROJECTS',
          actionCode: 'READ',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.data.explanation).toBeInstanceOf(Array);
        });
    });
  });
});
