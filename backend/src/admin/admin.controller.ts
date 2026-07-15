import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { Role } from '../../generated/prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  async getUsers(@Query('search') search?: string, @Query('role') role?: Role) {
    return this.adminService.getUsers(search, role);
  }

  @Patch('users/:id')
  async updateUser(@Param('id') id: string, @Body() data: { role?: Role }) {
    return this.adminService.updateUser(id, data);
  }

  @Get('sources')
  async getAllSources(@Query('userId') userId?: string) {
    return this.adminService.getAllSources(userId);
  }

  @Get('schemas')
  async getAllSchemas(@Query('sourceId') sourceId?: string) {
    return this.adminService.getAllSchemas(sourceId);
  }

  @Get('import-jobs')
  async getAllImportJobs(
    @Query('userId') userId?: string,
    @Query('sourceId') sourceId?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getAllImportJobs(userId, sourceId, status);
  }

  @Get('stats')
  async getPlatformStats() {
    return this.adminService.getPlatformStats();
  }
}
