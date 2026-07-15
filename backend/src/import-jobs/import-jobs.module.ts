import { Module } from '@nestjs/common';
import { ImportJobsService } from './import-jobs.service';
import { ImportJobsController } from './import-jobs.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ImportJobsController],
  providers: [ImportJobsService],
})
export class ImportJobsModule {}
