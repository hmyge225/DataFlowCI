import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Schema Versions (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let user1Token: string;
  let user2Token: string;
  let sourceId: string;
  let otherSourceId: string;

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

    await prisma.schemaVersion.deleteMany().catch(() => undefined);
    await prisma.source.deleteMany().catch(() => undefined);

    await request(app.getHttpServer()).post('/auth/register').send({
      email: 'schema-user1@test.local',
      password: 'password123',
      firstName: 'Schema',
      lastName: 'One',
      nameCorporate: 'Corp1',
    });
    const login1 = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'schema-user1@test.local', password: 'password123' });
    user1Token = (login1.body as { access_token: string }).access_token;

    await request(app.getHttpServer()).post('/auth/register').send({
      email: 'schema-user2@test.local',
      password: 'password123',
      firstName: 'Schema',
      lastName: 'Two',
      nameCorporate: 'Corp2',
    });
    const login2 = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'schema-user2@test.local', password: 'password123' });
    user2Token = (login2.body as { access_token: string }).access_token;

    const s1 = await request(app.getHttpServer())
      .post('/sources')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ name: 'Source Schema Test' });
    sourceId = (s1.body as { id: string }).id;

    const s2 = await request(app.getHttpServer())
      .post('/sources')
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ name: 'Other Source' });
    otherSourceId = (s2.body as { id: string }).id;
  }, 30000);

  afterAll(async () => {
    await prisma.schemaVersion.deleteMany().catch(() => undefined);
    await prisma.source.deleteMany().catch(() => undefined);
    await prisma.user
      .deleteMany({
        where: {
          email: { in: ['schema-user1@test.local', 'schema-user2@test.local'] },
        },
      })
      .catch(() => undefined);
    await prisma.$disconnect();
    await app.close();
  }, 30000);

  const validFields = [
    { name: 'email', type: 'string', required: true },
    { name: 'age', type: 'integer', required: false, min: 0, max: 120 },
  ];

  it('POST creates version 1 on first schema creation', async () => {
    const res = await request(app.getHttpServer())
      .post(`/sources/${sourceId}/schemas`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ fields: validFields })
      .expect(201);

    const body = res.body as { version: number; sourceId: string };
    expect(body.version).toBe(1);
    expect(body.sourceId).toBe(sourceId);
  });

  it('POST creates version 2 on second schema creation (max+1)', async () => {
    const res = await request(app.getHttpServer())
      .post(`/sources/${sourceId}/schemas`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ fields: validFields })
      .expect(201);

    expect((res.body as { version: number }).version).toBe(2);
  });

  it('POST rejects empty fields array', async () => {
    await request(app.getHttpServer())
      .post(`/sources/${sourceId}/schemas`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ fields: [] })
      .expect(400);
  });

  it('POST rejects invalid field structure (missing name)', async () => {
    await request(app.getHttpServer())
      .post(`/sources/${sourceId}/schemas`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ fields: [{ type: 'string' }] })
      .expect(400);
  });

  it('POST returns 404 when creating schema on another user source', async () => {
    await request(app.getHttpServer())
      .post(`/sources/${otherSourceId}/schemas`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ fields: validFields })
      .expect(404);
  });

  it('GET /schemas returns full history ordered by version desc', async () => {
    const res = await request(app.getHttpServer())
      .get(`/sources/${sourceId}/schemas`)
      .set('Authorization', `Bearer ${user1Token}`)
      .expect(200);

    const body = res.body as { version: number }[];
    expect(body.length).toBe(2);
    expect(body[0].version).toBe(2);
    expect(body[1].version).toBe(1);
  });

  it('GET /schemas returns 404 for another user source', async () => {
    await request(app.getHttpServer())
      .get(`/sources/${otherSourceId}/schemas`)
      .set('Authorization', `Bearer ${user1Token}`)
      .expect(404);
  });

  it('GET /schemas/:version returns the specific version', async () => {
    const res = await request(app.getHttpServer())
      .get(`/sources/${sourceId}/schemas/1`)
      .set('Authorization', `Bearer ${user1Token}`)
      .expect(200);

    expect((res.body as { version: number }).version).toBe(1);
  });

  it('GET /schemas/:version returns 404 for non-existent version', async () => {
    await request(app.getHttpServer())
      .get(`/sources/${sourceId}/schemas/999`)
      .set('Authorization', `Bearer ${user1Token}`)
      .expect(404);
  });

  it('no PATCH route exists on schema versions (immutability enforced)', async () => {
    await request(app.getHttpServer())
      .patch(`/sources/${sourceId}/schemas/1`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ fields: validFields })
      .expect(404);
  });
});
