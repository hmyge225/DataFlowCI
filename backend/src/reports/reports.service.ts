import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.validationReport.findMany({
      include: {
        importJob: {
          include: {
            source: true,
            schemaVersion: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.validationReport.findUnique({
      where: { id },
      include: {
        importJob: {
          include: {
            source: true,
            schemaVersion: true,
          },
        },
      },
    });
  }

  async findByImportJob(importJobId: string) {
    return this.prisma.validationReport.findFirst({
      where: { importJobId },
      include: {
        importJob: {
          include: {
            source: true,
            schemaVersion: true,
          },
        },
      },
    });
  }
}
