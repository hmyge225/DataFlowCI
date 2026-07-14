import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// @Global() signifie que ce module est disponible dans TOUTE l'application
// sans avoir besoin de l'importer dans chaque module. C'est pratique pour
// PrismaService car presque tous les modules en ont besoin.
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
