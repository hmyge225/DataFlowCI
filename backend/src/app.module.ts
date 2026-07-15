import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { SourcesModule } from './sources/sources.module';
import { SchemasModule } from './schemas/schemas.module';
import { UploadsModule } from './uploads/uploads.module';
import { ImportJobsModule } from './import-jobs/import-jobs.module';
import { QueueModule } from './queue/queue.module';
import { WorkerModule } from './worker/worker.module';
import { ReportsModule } from './reports/reports.module';
import { ExportModule } from './export/export.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AdminModule } from './admin/admin.module';

// ConfigModule charge les variables d'environnement (.env) pour toute l'application.
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // isGlobal = disponible partout sans l'importer
    PrismaModule,
    AuthModule,
    SourcesModule,
    SchemasModule,
    UploadsModule,
    ImportJobsModule,
    QueueModule,
    WorkerModule,
    ReportsModule,
    ExportModule,
    DashboardModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
