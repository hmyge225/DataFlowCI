import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../../generated/prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getUsers(search?: string, role?: Role) {
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [{ email: { contains: search, mode: 'insensitive' } }];
    }

    if (role) {
      where.role = role;
    }

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            importJobs: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateUser(id: string, data: { role?: Role }) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async getAllSources(userId?: string) {
    const where: Record<string, unknown> = {};
    if (userId) {
      where.userId = userId;
    }

    return this.prisma.source.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        _count: {
          select: {
            importJobs: true,
            schemaVersions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllSchemas(sourceId?: string) {
    const where: Record<string, unknown> = {};
    if (sourceId) {
      where.sourceId = sourceId;
    }

    return this.prisma.schemaVersion.findMany({
      where,
      include: {
        source: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: [{ sourceId: 'asc' }, { version: 'desc' }],
    });
  }

  async getAllImportJobs(userId?: string, sourceId?: string, status?: string) {
    const where: Record<string, unknown> = {};
    if (userId) {
      where.userId = userId;
    }
    if (sourceId) {
      where.sourceId = sourceId;
    }
    if (status) {
      where.status = status;
    }

    return this.prisma.importJob.findMany({
      where,
      include: {
        source: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
        schemaVersion: true,
        report: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPlatformStats() {
    const totalImports = await this.prisma.importJob.count();
    const successCount = await this.prisma.importJob.count({
      where: { status: 'SUCCESS' },
    });
    const partialCount = await this.prisma.importJob.count({
      where: { status: 'PARTIAL' },
    });
    const failedCount = await this.prisma.importJob.count({
      where: { status: 'FAILED' },
    });

    const totalUsers = await this.prisma.user.count();
    const totalSources = await this.prisma.source.count();
    const totalSchemas = await this.prisma.schemaVersion.count();

    // Top sources
    const topSources = await this.prisma.importJob.groupBy({
      by: ['sourceId'],
      _count: { sourceId: true },
      orderBy: { _count: { sourceId: 'desc' } },
      take: 5,
    });

    const topSourcesWithNames = await Promise.all(
      topSources.map(async (item) => {
        const source = await this.prisma.source.findUnique({
          where: { id: item.sourceId },
          select: { name: true, user: { select: { email: true } } },
        });
        return {
          sourceId: item.sourceId,
          sourceName: source?.name || 'N/A',
          userEmail: source?.user?.email || 'N/A',
          count: item._count.sourceId,
        };
      }),
    );

    // Top users
    const topUsers = await this.prisma.importJob.groupBy({
      by: ['userId'],
      _count: { userId: true },
      orderBy: { _count: { userId: 'desc' } },
      take: 5,
    });

    const topUsersWithEmails = await Promise.all(
      topUsers.map(async (item) => {
        const user = await this.prisma.user.findUnique({
          where: { id: item.userId },
          select: { email: true },
        });
        return {
          userId: item.userId,
          email: user?.email || 'N/A',
          count: item._count.userId,
        };
      }),
    );

    // Temps moyen de traitement
    const completedJobs = await this.prisma.importJob.findMany({
      where: { status: { in: ['SUCCESS', 'PARTIAL', 'FAILED'] } },
      select: { startedAt: true, finishedAt: true },
    });

    const avgProcessingTime =
      completedJobs.length > 0
        ? completedJobs.reduce((sum, job) => {
            if (job.startedAt && job.finishedAt) {
              const diff =
                new Date(job.finishedAt).getTime() -
                new Date(job.startedAt).getTime();
              return sum + diff / 1000;
            }
            return sum;
          }, 0) / completedJobs.length
        : 0;

    // Imports par jour (30 derniers jours)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const importsByDay = await this.prisma.importJob.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
      _count: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const importsByDayFormatted = importsByDay.map((item) => ({
      date: item.createdAt.toISOString().split('T')[0],
      count: item._count.createdAt,
    }));

    return {
      totalImports,
      successCount,
      partialCount,
      failedCount,
      totalUsers,
      totalSources,
      totalSchemas,
      avgProcessingTime: Math.round(avgProcessingTime),
      topSources: topSourcesWithNames,
      topUsers: topUsersWithEmails,
      importsByDay: importsByDayFormatted,
    };
  }
}
