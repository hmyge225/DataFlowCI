import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadResponseDto } from './dto/upload-response.dto';
import * as fs from 'fs/promises';
import * as path from 'path';

// Service de gestion des uploads : stockage local + création ImportJob PENDING.
// Le traitement effectif du fichier sera fait par le worker (BullMQ) dans une phase ultérieure.
@Injectable()
export class UploadsService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor(private prisma: PrismaService) {
    void this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch {
      // Ignore si le dossier existe déjà
    }
  }

  // Vérifie que la source existe, appartient à l'utilisateur, et a un schéma actif
  private async assertSourceWithActiveSchema(
    sourceId: string,
    userId: string,
    isAdmin: boolean,
  ) {
    const source = await this.prisma.source.findFirst({
      where: { id: sourceId, deletedAt: null },
      include: {
        schemaVersions: {
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
    });

    if (!source) {
      throw new NotFoundException('Source introuvable');
    }

    if (!isAdmin && source.userId !== userId) {
      throw new NotFoundException('Source introuvable');
    }

    if (!source.schemaVersions || source.schemaVersions.length === 0) {
      throw new BadRequestException(
        "Aucun schéma de validation défini pour cette source. Créez un schéma avant d'uploader.",
      );
    }

    return {
      source,
      activeSchemaVersion: source.schemaVersions[0],
    };
  }

  async uploadFile(
    sourceId: string,
    file: { originalname: string; buffer: Buffer },
    userId: string,
    isAdmin: boolean,
  ): Promise<UploadResponseDto> {
    const { activeSchemaVersion } = await this.assertSourceWithActiveSchema(
      sourceId,
      userId,
      isAdmin,
    );

    // Générer un nom de fichier unique
    const uniqueFilename = `${Date.now()}-${file.originalname}`;
    const filepath = path.join(this.uploadDir, uniqueFilename);

    // Écrire le fichier sur disque
    await fs.writeFile(filepath, file.buffer);

    // Créer l'ImportJob en PENDING
    const importJob = await this.prisma.importJob.create({
      data: {
        sourceId,
        schemaVersionId: activeSchemaVersion.id,
        userId,
        filepath,
        originalFilename: file.originalname,
        status: 'PENDING',
      },
    });

    return {
      importJobId: importJob.id,
      status: importJob.status,
      message: 'Fichier uploadé avec succès, traitement en cours',
    };
  }
}
