import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as bcrypt from 'bcrypt';

// Seeder de base : crée un ADMIN et un USER de test si absents.
const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  const saltRounds = 10;

  const adminEmail = 'admin@dataflowci.com';
  const adminPassword = await bcrypt.hash('Admin123!', saltRounds);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'Guillaume',
      nameCorporate: 'DataFlowCI',
      role: 'ADMIN',
    },
  });

  const userEmail = 'pullo@dataflowci.com';
  const userPassword = await bcrypt.hash('User123!', saltRounds);

  const user = await prisma.user.upsert({
    where: { email: userEmail },
    update: {},
    create: {
      email: userEmail,
      password: userPassword,
      firstName: 'Pullo',
      lastName: 'Fahé',
      nameCorporate: 'BSTEC',
      role: 'USER',
    },
  });

  // Source de démo rattachée au USER de test (idempotent via un id fixe).
  const demoSourceId = '00000000-0000-0000-0000-000000000001';
  const source = await prisma.source.upsert({
    where: { id: demoSourceId },
    update: {},
    create: {
      id: demoSourceId,
      userId: user.id,
      name: 'Source de démonstration',
      description: 'Source créée automatiquement par le seed pour les tests.',
      isActive: true,
    },
  });

  // SchemaVersion v1 de démo (immutable). Idempotent via la contrainte (sourceId, version).
  const demoFields = [
    {
      name: 'email',
      type: 'string',
      required: true,
      pattern: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$',
    },
    { name: 'age', type: 'integer', required: false, min: 0, max: 120 },
    {
      name: 'status',
      type: 'enum',
      required: true,
      enum: ['active', 'inactive'],
    },
  ];

  await prisma.schemaVersion.upsert({
    where: { sourceId_version: { sourceId: source.id, version: 1 } },
    update: {},
    create: {
      sourceId: source.id,
      version: 1,
      fields: demoFields,
    },
  });

  console.log('🌱 Seed terminé !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
