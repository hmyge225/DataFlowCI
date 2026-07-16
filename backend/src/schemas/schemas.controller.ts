import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
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
  ApiNoContentResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { SchemasService } from './schemas.service';
import { CreateSchemaVersionDto } from './dto/create-schema-version.dto';
import { ImportSchemaDto } from './dto/import-schema.dto';
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

  // POST /sources/:sourceId/schemas/import
  // Importe un schéma depuis un fichier JSON formaté.
  @Post('import')
  @ApiOperation({
    summary: 'Importer un schéma depuis un fichier JSON',
    description:
      'Importe une définition de schéma depuis un fichier JSON respectant le format spécifié. Crée automatiquement la version suivante ou utilise la version spécifiée.',
  })
  @ApiCreatedResponse({ description: 'Version de schéma importée avec succès.' })
  @ApiBadRequestResponse({ description: 'Format JSON invalide.' })
  @ApiNotFoundResponse({ description: 'Source introuvable.' })
  async importFromJson(
    @Param('sourceId') sourceId: string,
    @Body() dto: ImportSchemaDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const isAdmin = user.role === 'ADMIN';
    return this.schemasService.importFromJson(sourceId, dto, user.userId, isAdmin);
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

  // DELETE /sources/:sourceId/schemas/:version
  @Delete(':version')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Supprimer une version de schéma",
    description: "Supprime une version de schéma uniquement si elle n'est liée à aucun job d'import.",
  })
  @ApiNoContentResponse({ description: 'Version de schéma supprimée avec succès.' })
  @ApiNotFoundResponse({
    description: 'Source ou version de schéma introuvable.',
  })
  @ApiConflictResponse({
    description: "Impossible de supprimer : cette version est liée à des jobs d'import.",
  })
  async delete(
    @Param('sourceId') sourceId: string,
    @Param('version', ParseIntPipe) version: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const isAdmin = user.role === 'ADMIN';
    return this.schemasService.delete(sourceId, version, user.userId, isAdmin);
  }
}
