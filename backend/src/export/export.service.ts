import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs/promises';

@Injectable()
export class ExportService {
  constructor(private prisma: PrismaService) {}

  async verifyOwnership(importJobId: string, userId: string, isAdmin: boolean) {
    const job = await this.prisma.importJob.findUnique({
      where: { id: importJobId },
    });

    if (!job) {
      throw new NotFoundException('ImportJob introuvable');
    }

    if (!isAdmin && job.userId !== userId) {
      throw new ForbiddenException('Accès non autorisé');
    }

    return job;
  }

  async exportValidRows(importJobId: string, userId: string, isAdmin: boolean) {
    await this.verifyOwnership(importJobId, userId, isAdmin);

    const importedRows = await this.prisma.importedRow.findMany({
      where: {
        importJobId,
        isValid: true,
      },
      orderBy: { rowIndex: 'asc' },
    });

    if (importedRows.length === 0) {
      throw new NotFoundException('Aucune ligne valide à exporter');
    }

    // Générer CSV depuis les données
    const headers = Object.keys(
      importedRows[0].data as Record<string, unknown>,
    );
    const csvRows = [
      headers.join(','),
      ...importedRows.map((row) => {
        const data = row.data as Record<string, unknown>;
        return headers
          .map((header) => {
            const value = data[header];
            // Échapper les valeurs contenant des virgules ou des guillemets
            const strValue =
              typeof value === 'string' ? value : JSON.stringify(value);
            if (
              strValue.includes(',') ||
              strValue.includes('"') ||
              strValue.includes('\n')
            ) {
              return `"${strValue.replace(/"/g, '""')}"`;
            }
            return strValue;
          })
          .join(',');
      }),
    ];

    return csvRows.join('\n');
  }

  async exportErrorsReport(
    importJobId: string,
    userId: string,
    isAdmin: boolean,
  ) {
    await this.verifyOwnership(importJobId, userId, isAdmin);

    const validationErrors = await this.prisma.validationError.findMany({
      where: {
        importedRow: {
          importJobId,
        },
      },
      include: {
        importedRow: {
          include: {
            importJob: true,
          },
        },
      },
      orderBy: { importedRow: { rowIndex: 'asc' } },
    });

    if (validationErrors.length === 0) {
      throw new NotFoundException('Aucune erreur à exporter');
    }

    // Générer CSV du rapport d'erreurs
    const headers = ['Ligne', 'Colonne', 'Message', 'Données'];
    const csvRows = [
      headers.join(','),
      ...validationErrors.map((error) => {
        const rowData = error.importedRow.data as Record<string, unknown>;
        const rowDataStr = JSON.stringify(rowData);
        const row = [
          error.importedRow.rowIndex,
          error.column,
          `"${error.message.replace(/"/g, '""')}"`,
          `"${rowDataStr.replace(/"/g, '""')}"`,
        ];
        return row.join(',');
      }),
    ];

    return csvRows.join('\n');
  }

  async exportOriginalFile(
    importJobId: string,
    userId: string,
    isAdmin: boolean,
  ) {
    if (!isAdmin) {
      throw new ForbiddenException('Accès réservé aux administrateurs');
    }

    const job = await this.verifyOwnership(importJobId, userId, isAdmin);

    try {
      const fileBuffer = await fs.readFile(job.filepath);
      return {
        filename: job.originalFilename,
        buffer: fileBuffer,
      };
    } catch {
      throw new NotFoundException('Fichier original introuvable');
    }
  }
}
