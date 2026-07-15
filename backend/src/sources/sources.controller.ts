import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { SourcesService } from './sources.service';
import { CreateSourceDto, UpdateSourceDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  AuthenticatedUser,
} from '../auth/decorators/current-user.decorator';

@ApiTags('sources')
@Controller('sources')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Token manquant ou invalide.' })
export class SourcesController {
  constructor(private sourcesService: SourcesService) {}

  // POST /sources
  // User uniquement : crée une source attachée à l'utilisateur connecté.
  @Post()
  @ApiOperation({
    summary: 'Créer une source',
    description:
      "Crée une nouvelle source de données liée à l'utilisateur connecté.",
  })
  @ApiCreatedResponse({ description: 'Source créée avec succès.' })
  @ApiBadRequestResponse({ description: 'Données invalides.' })
  async create(
    @Body() dto: CreateSourceDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.sourcesService.create(dto, user.userId);
  }

  // GET /sources
  // User : ses propres sources (non supprimées).
  // Admin : toutes les sources, avec filtre optionnel ?userId=.
  @Get()
  @ApiOperation({
    summary: 'Lister les sources',
    description:
      'User : retourne ses propres sources. Admin : retourne toutes les sources avec filtre optionnel userId.',
  })
  @ApiOkResponse({ description: 'Liste des sources.' })
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
    return this.sourcesService.findAll(user.userId, isAdmin, queryUserId);
  }

  // GET /sources/:id
  @Get(':id')
  @ApiOperation({
    summary: "Détail d'une source",
    description: 'Retourne une source avec ses versions de schéma.',
  })
  @ApiOkResponse({ description: 'Source trouvée.' })
  @ApiNotFoundResponse({ description: 'Source introuvable.' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const isAdmin = user.role === 'ADMIN';
    return this.sourcesService.findOne(id, user.userId, isAdmin);
  }

  // PATCH /sources/:id
  @Patch(':id')
  @ApiOperation({
    summary: 'Modifier une source',
    description: "Met à jour les champs modifiables d'une source.",
  })
  @ApiOkResponse({ description: 'Source mise à jour.' })
  @ApiNotFoundResponse({ description: 'Source introuvable.' })
  @ApiBadRequestResponse({ description: 'Données invalides.' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSourceDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const isAdmin = user.role === 'ADMIN';
    return this.sourcesService.update(id, dto, user.userId, isAdmin);
  }

  // DELETE /sources/:id
  @Delete(':id')
  @ApiOperation({
    summary: 'Supprimer une source',
    description:
      'Supprime définitivement si aucun import existant. Sinon, soft delete.',
  })
  @ApiOkResponse({ description: 'Source supprimée.' })
  @ApiNotFoundResponse({ description: 'Source introuvable.' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const isAdmin = user.role === 'ADMIN';
    return this.sourcesService.remove(id, user.userId, isAdmin);
  }
}
