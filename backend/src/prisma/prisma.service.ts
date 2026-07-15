import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
// PrismaClient est la classe qui permet de communiquer avec la base de données.
// Elle expose des méthodes comme prisma.user.create(), prisma.refreshToken.findMany(), etc.
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // Prisma 7 nécessite un "adapter" pour se connecter à la base de données.
    const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);

    super({ adapter });
  }

  // OnModuleInit : Au démarrage de l'application.
  // On y connecte le client Prisma à la base de données.
  async onModuleInit() {
    await this.$connect();
  }

  // OnModuleDestroy : À l'arrêt de l'application.
  // On déconnecte proprement le client pour éviter les fuites de connexion.
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
