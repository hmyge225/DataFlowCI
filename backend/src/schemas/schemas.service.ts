import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSchemaVersionDto } from './dto/create-schema-version.dto';
import { Prisma } from '../../generated/prisma/client';

// Service métier : gère les SchemaVersion (versions de schéma de validation d'une Source).
// Règle métier critique : un SchemaVersion n'est JAMAIS modifié une fois créé.
// Toute "modification" crée une nouvelle version (version = max + 1).
// Ownership : seul le propriétaire de la Source (ou un ADMIN) peut créer/consulter ses schémas.
@Injectable()
export class SchemasService {
  constructor(private prisma: PrismaService) {}

  // Vérifie que la source existe, n'est pas supprimée, et appartient à l'utilisateur (sauf admin).
  private async assertSourceOwnership(
    sourceId: string,
    userId: string,
    isAdmin: boolean,
  ) {
    const source = await this.prisma.source.findFirst({
      where: { id: sourceId, deletedAt: null },
    });

    if (!source) {
      throw new NotFoundException('Source introuvable');
    }

    if (!isAdmin && source.userId !== userId) {
      throw new NotFoundException('Source introuvable');
    }

    return source;
  }

  async create(
    sourceId: string,
    dto: CreateSchemaVersionDto,
    userId: string,
    isAdmin: boolean,
  ) {
    await this.assertSourceOwnership(sourceId, userId, isAdmin);

    const latest = await this.prisma.schemaVersion.findFirst({
      where: { sourceId },
      orderBy: { version: 'desc' },
    });

    const nextVersion = latest ? latest.version + 1 : 1;

    return this.prisma.schemaVersion.create({
      data: {
        sourceId,
        version: nextVersion,
        fields: dto.fields as unknown as Prisma.InputJsonValue,
      },
    });
  }

  async findAll(sourceId: string, userId: string, isAdmin: boolean) {
    await this.assertSourceOwnership(sourceId, userId, isAdmin);

    return this.prisma.schemaVersion.findMany({
      where: { sourceId },
      orderBy: { version: 'desc' },
    });
  }

  async findOne(
    sourceId: string,
    version: number,
    userId: string,
    isAdmin: boolean,
  ) {
    await this.assertSourceOwnership(sourceId, userId, isAdmin);

    const schemaVersion = await this.prisma.schemaVersion.findUnique({
      where: { sourceId_version: { sourceId, version } },
    });

    if (!schemaVersion) {
      throw new NotFoundException('Version de schéma introuvable');
    }

    return schemaVersion;
  }
}
