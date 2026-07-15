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
      lastName: 'DataFlowCI',
      nameCorporate: 'DataFlowCI',
      role: 'ADMIN',
    },
  });

  const userEmail = 'user@dataflowci.com';
  const userPassword = await bcrypt.hash('User123!', saltRounds);

  await prisma.user.upsert({
    where: { email: userEmail },
    update: {},
    create: {
      email: userEmail,
      password: userPassword,
      firstName: 'John',
      lastName: 'Doe',
      nameCorporate: 'BSTEC',
      role: 'USER',
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
