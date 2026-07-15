import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSourceDto, UpdateSourceDto } from './dto';

// Service métier : gère les Sources avec vérification stricte d'ownership.
// - Un USER ne voit que ses propres sources (non supprimées).
// - Un ADMIN voit toutes les sources (non supprimées) et peut filtrer par userId.
// - La suppression est soft delete (deletedAt) pour préserver l'historique des imports.
@Injectable()
export class SourcesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSourceDto, userId: string) {
    return this.prisma.source.create({
      data: {
        name: dto.name,
        description: dto.description,
        isActive: dto.isActive ?? true,
        userId,
      },
    });
  }

  // Retourne les sources accessibles selon le rôle.
  // userId : l'utilisateur connecté
  // isAdmin : si true, retourne toutes les sources (non supprimées) + filtre optionnel
  // queryUserId : pour admin, filtre par propriétaire
  async findAll(userId: string, isAdmin: boolean, queryUserId?: string) {
    const baseWhere = { deletedAt: null as Date | null };

    if (isAdmin) {
      return this.prisma.source.findMany({
        where: {
          ...baseWhere,
          ...(queryUserId ? { userId: queryUserId } : {}),
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: { schemaVersions: true, importJobs: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return this.prisma.source.findMany({
      where: { ...baseWhere, userId },
      include: {
        _count: {
          select: { schemaVersions: true, importJobs: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string, isAdmin: boolean) {
    const source = await this.prisma.source.findFirst({
      where: { id, deletedAt: null },
      include: {
        user: isAdmin
          ? {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            }
          : false,
        schemaVersions: { orderBy: { version: 'desc' } },
      },
    });

    if (!source) {
      throw new NotFoundException('Source introuvable');
    }

    if (!isAdmin && source.userId !== userId) {
      throw new NotFoundException('Source introuvable');
    }

    return source;
  }

  async update(
    id: string,
    dto: UpdateSourceDto,
    userId: string,
    isAdmin: boolean,
  ) {
    // Vérification ownership + existence en une seule requête
    const source = await this.prisma.source.findFirst({
      where: { id, deletedAt: null },
    });

    if (!source) {
      throw new NotFoundException('Source introuvable');
    }

    if (!isAdmin && source.userId !== userId) {
      throw new NotFoundException('Source introuvable');
    }

    return this.prisma.source.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async remove(id: string, userId: string, isAdmin: boolean) {
    const source = await this.prisma.source.findFirst({
      where: { id, deletedAt: null },
      include: { importJobs: true },
    });

    if (!source) {
      throw new NotFoundException('Source introuvable');
    }

    if (!isAdmin && source.userId !== userId) {
      throw new NotFoundException('Source introuvable');
    }

    // Si des imports existent → soft delete (préserve l'historique).
    // Sinon → hard delete autorisé, mais soft delete reste plus sûr.
    if (source.importJobs.length > 0) {
      return this.prisma.source.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    }

    return this.prisma.source.delete({ where: { id } });
  }
}
