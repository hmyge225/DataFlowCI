import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../prisma/prisma.service';

describe('ImportJobs (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let userToken: string;
  let adminToken: string;
  let sourceId: string;
  let importJobId: string;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();
    prisma = moduleRef.get(PrismaService);

    await prisma.importJob.deleteMany().catch(() => undefined);
    await prisma.importedRow.deleteMany().catch(() => undefined);
    await prisma.validationError.deleteMany().catch(() => undefined);
    await prisma.validationReport.deleteMany().catch(() => undefined);
    await prisma.schemaVersion.deleteMany().catch(() => undefined);
    await prisma.source.deleteMany().catch(() => undefined);

    await request(app.getHttpServer()).post('/auth/register').send({
      email: 'import-user@test.local',
      password: 'password123',
      firstName: 'Import',
      lastName: 'User',
      nameCorporate: 'Corp',
    });
    const userLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'import-user@test.local', password: 'password123' });
    userToken = (userLogin.body as { access_token: string }).access_token;

    await request(app.getHttpServer()).post('/auth/register').send({
      email: 'admin@test.local',
      password: 'password123',
      firstName: 'Admin',
      lastName: 'User',
      nameCorporate: 'Corp',
    });
    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@test.local', password: 'password123' });
    adminToken = (adminLogin.body as { access_token: string }).access_token;

    const source = await request(app.getHttpServer())
      .post('/sources')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Import Test Source' });
    sourceId = (source.body as { id: string }).id;

    await request(app.getHttpServer())
      .post(`/sources/${sourceId}/schemas`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        fields: [
          { name: 'email', type: 'string', required: true },
          { name: 'age', type: 'integer', required: true },
        ],
      });

    const csvContent = 'email,age\njohn@example.com,25\njane@example.com,30';
    const buffer = Buffer.from(csvContent);

    const upload = await request(app.getHttpServer())
      .post(`/sources/${sourceId}/uploads`)
      .set('Authorization', `Bearer ${userToken}`)
      .attach('file', buffer, 'test.csv');
    importJobId = (upload.body as { importJobId: string }).importJobId;
  }, 30000);

  afterAll(async () => {
    await prisma.importJob.deleteMany().catch(() => undefined);
    await prisma.importedRow.deleteMany().catch(() => undefined);
    await prisma.validationError.deleteMany().catch(() => undefined);
    await prisma.validationReport.deleteMany().catch(() => undefined);
    await prisma.schemaVersion.deleteMany().catch(() => undefined);
    await prisma.source.deleteMany().catch(() => undefined);
    await prisma.user
      .deleteMany({
        where: {
          email: { in: ['import-user@test.local', 'admin@test.local'] },
        },
      })
      .catch(() => undefined);
    await prisma.$disconnect();
    await app.close();
  }, 30000);

  it('GET /import-jobs returns user jobs', async () => {
    const res = await request(app.getHttpServer())
      .get('/import-jobs')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    const jobs = res.body as Array<{ id: string }>;
    expect(Array.isArray(jobs)).toBe(true);
    expect(jobs.length).toBeGreaterThan(0);
    expect(jobs.some((j) => j.id === importJobId)).toBe(true);
  });

  it('GET /import-jobs/:id returns job details', async () => {
    const res = await request(app.getHttpServer())
      .get(`/import-jobs/${importJobId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    const job = res.body as { id: string; sourceId: string };
    expect(job.id).toBe(importJobId);
    expect(job.sourceId).toBe(sourceId);
  });

  it('GET /import-jobs/:id returns 404 for non-existent job', async () => {
    await request(app.getHttpServer())
      .get('/import-jobs/non-existent')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(404);
  });

  it('GET /import-jobs/:id returns 404 for other user job', async () => {
    await request(app.getHttpServer())
      .get(`/import-jobs/${importJobId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
  });

  it('DELETE /import-jobs/:id deletes job', async () => {
    await request(app.getHttpServer())
      .delete(`/import-jobs/${importJobId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/import-jobs/${importJobId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(404);
  });

  it('DELETE /import-jobs/:id returns 404 for non-existent job', async () => {
    await request(app.getHttpServer())
      .delete('/import-jobs/non-existent')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(404);
  });

  it('DELETE /import-jobs/:id returns 404 for other user job', async () => {
    const csvContent = 'email,age\njohn@example.com,25';
    const buffer = Buffer.from(csvContent);

    const upload = await request(app.getHttpServer())
      .post(`/sources/${sourceId}/uploads`)
      .set('Authorization', `Bearer ${userToken}`)
      .attach('file', buffer, 'test2.csv');
    const newJobId = (upload.body as { importJobId: string }).importJobId;

    await request(app.getHttpServer())
      .delete(`/import-jobs/${newJobId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
  });
});
