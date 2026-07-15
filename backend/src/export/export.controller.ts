import {
  Controller,
  Get,
  Param,
  Res,
  UseGuards,
  Req,
  Headers,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ExportService } from './export.service';

@Controller('import-jobs')
@UseGuards(JwtAuthGuard)
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get(':id/export/valid')
  async exportValidRows(
    @Param('id') id: string,
    @Req() req: Request & { user: { userId: string; role: string } },
    @Res() res: Response,
  ) {
    const csv = await this.exportService.exportValidRows(
      id,
      req.user.userId,
      req.user.role === 'ADMIN',
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="valid-rows-${id}.csv"`,
    );
    res.send(csv);
  }

  @Get(':id/export/errors')
  async exportErrorsReport(
    @Param('id') id: string,
    @Req() req: Request & { user: { userId: string; role: string } },
    @Res() res: Response,
  ) {
    const csv = await this.exportService.exportErrorsReport(
      id,
      req.user.userId,
      req.user.role === 'ADMIN',
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="errors-report-${id}.csv"`,
    );
    res.send(csv);
  }

  @Get(':id/export/original')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async exportOriginalFile(
    @Param('id') id: string,
    @Req() req: Request & { user: { userId: string; role: string } },
    @Res() res: Response,
  ) {
    const { filename, buffer } = await this.exportService.exportOriginalFile(
      id,
      req.user.userId,
      req.user.role === 'ADMIN',
    );

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }
}
