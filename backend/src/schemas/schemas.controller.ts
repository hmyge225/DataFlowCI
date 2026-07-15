import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
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
} from '@nestjs/swagger';
import { SchemasService } from './schemas.service';
import { CreateSchemaVersionDto } from './dto/create-schema-version.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  AuthenticatedUser,
} from '../auth/decorators/current-user.decorator';

// Routes imbriquées sous /sources/:sourceId/schemas.
// Aucune route PATCH/PUT n'existe : un SchemaVersion est immutable après création.
@ApiTags('schemas')
@Controller('sources/:sourceId/schemas')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Token manquant ou invalide.' })
export class SchemasController {
  constructor(private schemasService: SchemasService) {}

  // POST /sources/:sourceId/schemas
  // Crée automatiquement version = 1 si première, sinon version = max + 1.
  @Post()
  @ApiOperation({
    summary: 'Créer une nouvelle version de schéma',
    description:
      'Crée automatiquement la version suivante (max + 1). Aucune modification possible ensuite.',
  })
  @ApiCreatedResponse({ description: 'Version de schéma créée avec succès.' })
  @ApiBadRequestResponse({ description: 'Données invalides.' })
  @ApiNotFoundResponse({ description: 'Source introuvable.' })
  async create(
    @Param('sourceId') sourceId: string,
    @Body() dto: CreateSchemaVersionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const isAdmin = user.role === 'ADMIN';
    return this.schemasService.create(sourceId, dto, user.userId, isAdmin);
  }

  // GET /sources/:sourceId/schemas
  // Historique complet des versions, triées de la plus récente à la plus ancienne.
  @Get()
  @ApiOperation({
    summary: "Historique des versions de schéma d'une source",
  })
  @ApiOkResponse({ description: 'Liste des versions de schéma.' })
  @ApiNotFoundResponse({ description: 'Source introuvable.' })
  async findAll(
    @Param('sourceId') sourceId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const isAdmin = user.role === 'ADMIN';
    return this.schemasService.findAll(sourceId, user.userId, isAdmin);
  }

  // GET /sources/:sourceId/schemas/:version
  @Get(':version')
  @ApiOperation({ summary: "Détail d'une version de schéma spécifique" })
  @ApiOkResponse({ description: 'Version de schéma trouvée.' })
  @ApiNotFoundResponse({
    description: 'Source ou version de schéma introuvable.',
  })
  async findOne(
    @Param('sourceId') sourceId: string,
    @Param('version', ParseIntPipe) version: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const isAdmin = user.role === 'ADMIN';
    return this.schemasService.findOne(sourceId, version, user.userId, isAdmin);
  }
}
