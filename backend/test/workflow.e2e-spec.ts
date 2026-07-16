import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Workflow (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;

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

  describe('GET /api/v1/workflows', () => {
    it('should list active workflows', () => {
      return request(app.getHttpServer())
        .get('/api/v1/workflows')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('GET /api/v1/workflows/:id/steps', () => {
    it('should return steps for a workflow', async () => {
      const workflowsRes = await request(app.getHttpServer())
        .get('/api/v1/workflows')
        .set('Authorization', `Bearer ${adminToken}`);

      const workflowId = workflowsRes.body.data?.[0]?.id;
      if (!workflowId) return; // skip if no workflows seeded

      return request(app.getHttpServer())
        .get(`/api/v1/workflows/${workflowId}/steps`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('GET /api/v1/approvals/pending', () => {
    it('should return pending approvals', () => {
      return request(app.getHttpServer())
        .get('/api/v1/approvals/pending')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('GET /api/v1/approvals/submitted', () => {
    it('should return submitted requests', () => {
      return request(app.getHttpServer())
        .get('/api/v1/approvals/submitted')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('POST /api/v1/workflows/:id/submit', () => {
    it('should submit a new approval request', async () => {
      const workflowsRes = await request(app.getHttpServer())
        .get('/api/v1/workflows')
        .set('Authorization', `Bearer ${adminToken}`);

      const workflowId = workflowsRes.body.data?.[0]?.id;
      if (!workflowId) return;

      return request(app.getHttpServer())
        .post(`/api/v1/workflows/${workflowId}/submit`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ projectId: 1, entityType: 'PROJECT', entityId: '1' })
        .expect(201);
    });
  });
});
