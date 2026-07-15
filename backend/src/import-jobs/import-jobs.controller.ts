import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { ImportJobsService } from './import-jobs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  AuthenticatedUser,
} from '../auth/decorators/current-user.decorator';

@ApiTags('import-jobs')
@Controller('import-jobs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Token manquant ou invalide.' })
export class ImportJobsController {
  constructor(private importJobsService: ImportJobsService) {}

  // GET /import-jobs
  // User : ses propres jobs.
  // Admin : tous les jobs, avec filtre optionnel ?userId=.
  @Get()
  @ApiOperation({
    summary: "Lister les jobs d'import",
    description:
      'User : retourne ses propres jobs. Admin : retourne tous les jobs avec filtre optionnel userId.',
  })
  @ApiOkResponse({ description: "Liste des jobs d'import." })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filtre par propriétaire (Admin uniquement)',
  })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('userId') queryUserId?: string,
  ) {
    const isAdmin = user.role === 'ADMIN';
    return this.importJobsService.findAll(user.userId, isAdmin, queryUserId);
  }

  // GET /import-jobs/:id
  @Get(':id')
  @ApiOperation({
    summary: "Détail d'un job d'import",
    description: "Retourne un job d'import avec son rapport de validation.",
  })
  @ApiOkResponse({ description: 'Job trouvé.' })
  @ApiNotFoundResponse({ description: 'Job introuvable.' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const isAdmin = user.role === 'ADMIN';
    return this.importJobsService.findOne(id, user.userId, isAdmin);
  }

  // DELETE /import-jobs/:id
  @Delete(':id')
  @ApiOperation({
    summary: "Supprimer un job d'import",
    description:
      "Supprime un job d'import avec ses données associées (lignes, erreurs, rapport).",
  })
  @ApiOkResponse({ description: 'Job supprimé.' })
  @ApiNotFoundResponse({ description: 'Job introuvable.' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const isAdmin = user.role === 'ADMIN';
    return this.importJobsService.remove(id, user.userId, isAdmin);
  }
}
