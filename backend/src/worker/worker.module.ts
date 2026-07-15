import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { WorkerService } from './worker.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ValidationEngineModule } from '../validation-engine/validation-engine.module';
import { CsvParserService } from '../parsers/csv-parser.service';
import { ExcelParserService } from '../parsers/excel-parser.service';

@Module({
  imports: [
    PrismaModule,
    ValidationEngineModule,
    BullModule.registerQueue({
      name: 'import-jobs',
    }),
  ],
  providers: [WorkerService, CsvParserService, ExcelParserService],
})
export class WorkerModule {}
