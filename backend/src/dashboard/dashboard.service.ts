import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getUserDashboard(userId: string) {
    // Nombre total d'imports
    const totalImports = await this.prisma.importJob.count({
      where: { userId },
    });

    // Taux de succès/échec
    const successCount = await this.prisma.importJob.count({
      where: { userId, status: 'SUCCESS' },
    });
    const partialCount = await this.prisma.importJob.count({
      where: { userId, status: 'PARTIAL' },
    });
    const failedCount = await this.prisma.importJob.count({
      where: { userId, status: 'FAILED' },
    });

    // Temps moyen de traitement (en secondes)
    const completedJobs = await this.prisma.importJob.findMany({
      where: { userId, status: { in: ['SUCCESS', 'PARTIAL', 'FAILED'] } },
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

    // Top sources (les plus actives)
    const topSources = await this.prisma.importJob.groupBy({
      by: ['sourceId'],
      where: { userId },
      _count: { sourceId: true },
      orderBy: { _count: { sourceId: 'desc' } },
      take: 5,
    });

    const topSourcesWithNames = await Promise.all(
      topSources.map(async (item) => {
        const source = await this.prisma.source.findUnique({
          where: { id: item.sourceId },
          select: { name: true },
        });
        return {
          sourceId: item.sourceId,
          sourceName: source?.name || 'N/A',
          count: item._count.sourceId,
        };
      }),
    );

    // Imports par jour (30 derniers jours)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const importsByDay = await this.prisma.importJob.groupBy({
      by: ['createdAt'],
      where: {
        userId,
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
      avgProcessingTime: Math.round(avgProcessingTime),
      topSources: topSourcesWithNames,
      importsByDay: importsByDayFormatted,
    };
  }
}
