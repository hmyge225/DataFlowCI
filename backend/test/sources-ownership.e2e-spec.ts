import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('Sources Ownership (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let user1Token: string;
  let user2Token: string;
  let adminToken: string;
  let source1Id: string;
  let source2Id: string;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    prisma = moduleRef.get(PrismaService);

    // Nettoyage : ne supprime que les sources non liées à des imports (FK restrict)
    await prisma.source.deleteMany().catch(() => undefined);

    // Création user1
    await request(app.getHttpServer()).post('/auth/register').send({
      email: 'user1-ownership@test.local',
      password: 'password123',
      firstName: 'User',
      lastName: 'One',
      nameCorporate: 'Corp1',
    });
    const login1 = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user1-ownership@test.local', password: 'password123' });
    user1Token = (login1.body as { access_token: string }).access_token;

    // Création user2
    await request(app.getHttpServer()).post('/auth/register').send({
      email: 'user2-ownership@test.local',
      password: 'password123',
      firstName: 'User',
      lastName: 'Two',
      nameCorporate: 'Corp2',
    });
    const login2 = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user2-ownership@test.local', password: 'password123' });
    user2Token = (login2.body as { access_token: string }).access_token;

    // Création admin par user1 (impossible, donc on injecte directement en DB)
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin-ownership@test.local',
        password: '$2b$10$abcdefghijklmnopqrstuv', // bcrypt dummy, on ne teste pas le login
        firstName: 'Admin',
        lastName: 'Test',
        nameCorporate: 'Corp',
        role: 'ADMIN',
      },
    });
    // L'admin a besoin d'un token JWT. On ne peut pas le loguer avec un mauvais hash.
    // On va le créer avec un vrai hash bcrypt.
    const adminHash = await bcrypt.hash('adminpass123', 10);
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { password: adminHash },
    });
    const loginAdmin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin-ownership@test.local', password: 'adminpass123' });
    adminToken = (loginAdmin.body as { access_token: string }).access_token;

    // Création des sources
    const s1 = await request(app.getHttpServer())
      .post('/sources')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ name: 'Source User1', description: 'Test' });
    source1Id = (s1.body as { id: string }).id;

    const s2 = await request(app.getHttpServer())
      .post('/sources')
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ name: 'Source User2', description: 'Test' });
    source2Id = (s2.body as { id: string }).id;
  }, 30000);

  afterAll(async () => {
    await prisma.source.deleteMany().catch(() => undefined);
    await prisma.user
      .deleteMany({
        where: {
          email: {
            in: [
              'user1-ownership@test.local',
              'user2-ownership@test.local',
              'admin-ownership@test.local',
            ],
          },
        },
      })
      .catch(() => undefined);
    await prisma.$disconnect();
    await app.close();
  }, 30000);

  // ─── GET /sources ───
  it('GET /sources returns only own sources for user1', async () => {
    const res = await request(app.getHttpServer())
      .get('/sources')
      .set('Authorization', `Bearer ${user1Token}`)
      .expect(200);

    const body = res.body as { id: string }[];
    expect(body).toBeInstanceOf(Array);
    expect(body.length).toBe(1);
    expect(body[0].id).toBe(source1Id);
  });

  it('GET /sources returns all sources for admin with owner column', async () => {
    const res = await request(app.getHttpServer())
      .get('/sources')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const body = res.body as { id: string; user?: unknown }[];
    expect(body.length).toBeGreaterThanOrEqual(2);
    const ids = body.map((s) => s.id);
    expect(ids).toContain(source1Id);
    expect(ids).toContain(source2Id);
    // admin includes user owner data
    expect(body[0].user).toBeDefined();
  });

  // ─── GET /sources/:id ───
  it('GET /sources/:id returns own source for user1', async () => {
    await request(app.getHttpServer())
      .get(`/sources/${source1Id}`)
      .set('Authorization', `Bearer ${user1Token}`)
      .expect(200);
  });

  it('GET /sources/:id returns 404 for other user source (no info leak)', async () => {
    await request(app.getHttpServer())
      .get(`/sources/${source2Id}`)
      .set('Authorization', `Bearer ${user1Token}`)
      .expect(404);
  });

  it('GET /sources/:id returns any source for admin', async () => {
    await request(app.getHttpServer())
      .get(`/sources/${source1Id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });

  // ─── PATCH /sources/:id ───
  it('PATCH /sources/:id updates own source', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/sources/${source1Id}`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ name: 'Updated User1' })
      .expect(200);

    expect((res.body as { name: string }).name).toBe('Updated User1');
  });

  it('PATCH /sources/:id returns 404 for other user source', async () => {
    await request(app.getHttpServer())
      .patch(`/sources/${source2Id}`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ name: 'Hacked' })
      .expect(404);
  });

  // ─── DELETE /sources/:id ───
  it('DELETE /sources/:id deletes own source when no imports', async () => {
    await request(app.getHttpServer())
      .delete(`/sources/${source1Id}`)
      .set('Authorization', `Bearer ${user1Token}`)
      .expect(200);
  });

  it('DELETE /sources/:id returns 404 for other user source', async () => {
    await request(app.getHttpServer())
      .delete(`/sources/${source2Id}`)
      .set('Authorization', `Bearer ${user1Token}`)
      .expect(404);
  });
});
