import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Service métier : gère les ImportJob avec vérification stricte d'ownership.
// - Un USER ne voit que ses propres jobs.
// - Un ADMIN voit tous les jobs et peut filtrer par userId.
@Injectable()
export class ImportJobsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, isAdmin: boolean, queryUserId?: string) {
    const baseWhere = {};

    if (isAdmin) {
      return this.prisma.importJob.findMany({
        where: {
          ...baseWhere,
          ...(queryUserId ? { userId: queryUserId } : {}),
        },
        include: {
          source: {
            select: {
              id: true,
              name: true,
            },
          },
          schemaVersion: {
            select: {
              id: true,
              version: true,
            },
          },
          report: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return this.prisma.importJob.findMany({
      where: { ...baseWhere, userId },
      include: {
        source: {
          select: {
            id: true,
            name: true,
          },
        },
        schemaVersion: {
          select: {
            id: true,
            version: true,
          },
        },
        report: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string, isAdmin: boolean) {
    const job = await this.prisma.importJob.findUnique({
      where: { id },
      include: {
        source: {
          select: {
            id: true,
            name: true,
          },
        },
        schemaVersion: {
          select: {
            id: true,
            version: true,
          },
        },
        report: true,
      },
    });

    if (!job) {
      throw new NotFoundException('Job introuvable');
    }

    if (!isAdmin && job.userId !== userId) {
      throw new NotFoundException('Job introuvable');
    }

    return job;
  }

  async remove(id: string, userId: string, isAdmin: boolean) {
    const job = await this.prisma.importJob.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException('Job introuvable');
    }

    if (!isAdmin && job.userId !== userId) {
      throw new NotFoundException('Job introuvable');
    }

    // Suppression en cascade : ImportedRow, ValidationError, ValidationReport
    return this.prisma.importJob.delete({ where: { id } });
  }
}
