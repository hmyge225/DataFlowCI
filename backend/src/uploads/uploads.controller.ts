import {
  Controller,
  Post,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { UploadResponseDto } from './dto/upload-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  AuthenticatedUser,
} from '../auth/decorators/current-user.decorator';

@ApiTags('uploads')
@Controller('sources/:sourceId/uploads')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Token manquant ou invalide.' })
export class UploadsController {
  constructor(private uploadsService: UploadsService) {}

  @Post()
  @ApiOperation({
    summary: 'Uploader un fichier CSV ou Excel pour une source',
    description:
      'Upload un fichier CSV/Excel, le stocke localement et crée un ImportJob en PENDING. Le traitement sera effectué par le worker. Optionnellement, spécifiez une version de schéma.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        schemaVersion: {
          type: 'number',
          description: 'Version de schéma optionnelle. Si non fournie, utilise la dernière version.',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Fichier uploadé avec succès, job créé en PENDING.',
    type: UploadResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Fichier invalide ou source sans schéma.',
  })
  @ApiNotFoundResponse({ description: 'Source introuvable.' })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 20 * 1024 * 1024, // 20 Mo
      },
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(csv|xlsx|xls)$/i)) {
          return callback(
            new BadRequestException('Seuls les fichiers CSV, XLSX et XLS sont autorisés'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async upload(
    @Param('sourceId') sourceId: string,
    @UploadedFile() file: { originalname: string; buffer: Buffer },
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<UploadResponseDto> {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    const isAdmin = user.role === 'ADMIN';
    const schemaVersion = req.body?.schemaVersion ? parseInt(req.body.schemaVersion as string) : undefined;
    return this.uploadsService.uploadFile(sourceId, file, user.userId, isAdmin, schemaVersion);
  }
}
