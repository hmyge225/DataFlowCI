import { Injectable, Logger } from '@nestjs/common';
import {
  Processor,
  Process,
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
} from '@nestjs/bull';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { ValidationEngineService } from '../validation-engine/validation-engine.service';
import { CsvParserService } from '../parsers/csv-parser.service';
import { ExcelParserService } from '../parsers/excel-parser.service';
import * as fs from 'fs/promises';

// Worker BullMQ : traite les jobs d'import uploadés.
// - Lit le fichier (CSV/Excel)
// - Parse avec le bon parser (détection par extension)
// - Valide chaque ligne avec ValidationEngine
// - Insère ImportedRow + ValidationError en DB
// - Met à jour ImportJob status (SUCCESS/PARTIAL/FAILED)
// - Crée ValidationReport
@Injectable()
@Processor('import-jobs')
export class WorkerService {
  private readonly logger = new Logger(WorkerService.name);

  constructor(
    private prisma: PrismaService,
    private validationEngine: ValidationEngineService,
    private csvParser: CsvParserService,
    private excelParser: ExcelParserService,
  ) {}

  @Process('import-job')
  async handleImportJob(job: Job<{ importJobId: string }>) {
    const { importJobId } = job.data;
    this.logger.log(`Processing import job ${importJobId}`);

    try {
      const importJob = await this.prisma.importJob.findUnique({
        where: { id: importJobId },
        include: { schemaVersion: true },
      });

      if (!importJob) {
        throw new Error(`ImportJob ${importJobId} not found`);
      }

      await this.prisma.importJob.update({
        where: { id: importJobId },
        data: { status: 'PROCESSING', startedAt: new Date() },
      });

      const fileBuffer = await fs.readFile(importJob.filepath);
      const extension = importJob.originalFilename
        .split('.')
        .pop()
        ?.toLowerCase();

      let rows: Record<string, unknown>[] = [];

      if (extension === 'csv') {
        rows = this.csvParser.parse(fileBuffer);
      } else if (extension === 'xlsx' || extension === 'xls') {
        rows = this.excelParser.parse(fileBuffer);
      } else {
        throw new Error(`Unsupported file extension: ${extension}`);
      }

      const schema = {
        fields: importJob.schemaVersion.fields as Array<{
          name: string;
          type:
            'string' | 'integer' | 'date' | 'boolean' | 'number' | 'enum';
          required?: boolean;
          pattern?: string;
          enum?: unknown[];
          min?: number;
          max?: number;
        }>,
      };

      let validCount = 0;
      let invalidCount = 0;

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowIndex = i + 1;
        const errors = this.validationEngine.validate(schema, row);
        const isValid = errors.length === 0;

        if (isValid) {
          validCount++;
        } else {
          invalidCount++;
        }

        const importedRow = await this.prisma.importedRow.create({
          data: {
            importJobId,
            rowIndex,
            data: row as any,
            isValid,
          },
        });

        if (!isValid) {
          await this.prisma.validationError.createMany({
            data: errors.map((err) => ({
              importedRowId: importedRow.id,
              column: err.column,
              message: err.message,
            })),
          });
        }
      }

      const status =
        invalidCount === 0
          ? 'SUCCESS'
          : validCount === 0
            ? 'FAILED'
            : 'PARTIAL';

      await this.prisma.validationReport.create({
        data: {
          importJobId,
          total: rows.length,
          validCount,
          invalidCount,
        },
      });

      await this.prisma.importJob.update({
        where: { id: importJobId },
        data: { status, finishedAt: new Date() },
      });

      this.logger.log(
        `Job ${importJobId} completed: ${status} (${validCount} valid, ${invalidCount} invalid)`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Job ${importJobId} failed: ${errorMessage}`);
      await this.prisma.importJob.update({
        where: { id: importJobId },
        data: {
          status: 'FAILED',
          finishedAt: new Date(),
          errorMessage,
        },
      });
      throw error;
    }
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job) {
    this.logger.log(`Completed job ${job.id}`);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(`Failed job ${job.id}: ${error.message}`);
  }
}
