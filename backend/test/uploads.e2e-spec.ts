import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Uploads (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let userToken: string;
  let sourceId: string;
  let schemaVersionId: string;

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
      email: 'upload-user@test.local',
      password: 'password123',
      firstName: 'Upload',
      lastName: 'User',
      nameCorporate: 'Corp',
    });
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'upload-user@test.local', password: 'password123' });
    userToken = (login.body as { access_token: string }).access_token;

    const source = await request(app.getHttpServer())
      .post('/sources')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Upload Test Source' });
    sourceId = (source.body as { id: string }).id;

    const schema = await request(app.getHttpServer())
      .post(`/sources/${sourceId}/schemas`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        fields: [
          { name: 'email', type: 'string', required: true },
          { name: 'age', type: 'integer', required: true },
        ],
      });
    schemaVersionId = (schema.body as { id: string }).id;
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
        where: { email: 'upload-user@test.local' },
      })
      .catch(() => undefined);
    await prisma.$disconnect();
    await app.close();
  }, 30000);

  it('POST /sources/:id/uploads creates ImportJob PENDING with valid CSV', async () => {
    const csvContent = 'email,age\njohn@example.com,25\njane@example.com,30';
    const buffer = Buffer.from(csvContent);

    const res = await request(app.getHttpServer())
      .post(`/sources/${sourceId}/uploads`)
      .set('Authorization', `Bearer ${userToken}`)
      .attach('file', buffer, 'test.csv')
      .expect(201);

    const body = res.body as { importJobId: string; status: string };
    expect(body.status).toBe('PENDING');
    expect(body.importJobId).toBeDefined();

    const job = await prisma.importJob.findUnique({
      where: { id: body.importJobId },
    });
    expect(job).toBeTruthy();
    expect(job?.status).toBe('PENDING');
    expect(job?.sourceId).toBe(sourceId);
    expect(job?.schemaVersionId).toBe(schemaVersionId);
  });

  it('POST rejects non-CSV file extension', async () => {
    const buffer = Buffer.from('not a csv');

    await request(app.getHttpServer())
      .post(`/sources/${sourceId}/uploads`)
      .set('Authorization', `Bearer ${userToken}`)
      .attach('file', buffer, 'test.txt')
      .expect(400);
  });

  it('POST rejects upload when source has no schema', async () => {
    const source2 = await request(app.getHttpServer())
      .post('/sources')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'No Schema Source' });
    const source2Id = (source2.body as { id: string }).id;

    const buffer = Buffer.from('email,age\njohn@example.com,25');

    await request(app.getHttpServer())
      .post(`/sources/${source2Id}/uploads`)
      .set('Authorization', `Bearer ${userToken}`)
      .attach('file', buffer, 'test.csv')
      .expect(400);
  });

  it('POST returns 404 for non-existent source', async () => {
    const buffer = Buffer.from('email,age\njohn@example.com,25');

    await request(app.getHttpServer())
      .post('/sources/non-existent/uploads')
      .set('Authorization', `Bearer ${userToken}`)
      .attach('file', buffer, 'test.csv')
      .expect(404);
  });

  it('POST returns 400 when no file provided', async () => {
    await request(app.getHttpServer())
      .post(`/sources/${sourceId}/uploads`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(400);
  });
});
