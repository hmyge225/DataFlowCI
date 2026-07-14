import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';

// ConfigModule charge les variables d'environnement (.env) pour toute l'application.
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // isGlobal = disponible partout sans l'importer
    PrismaModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
