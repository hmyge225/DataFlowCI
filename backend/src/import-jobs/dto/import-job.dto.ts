import { ApiProperty } from '@nestjs/swagger';

export class ImportJobDto {
  @ApiProperty({
    description: "ID du job d'import",
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'ID de la source',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  sourceId!: string;

  @ApiProperty({
    description: 'ID de la version de schéma utilisée',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  schemaVersionId!: string;

  @ApiProperty({
    description: 'Statut du job',
    example: 'PENDING',
    enum: ['PENDING', 'PROCESSING', 'SUCCESS', 'PARTIAL', 'FAILED'],
  })
  status!: string;

  @ApiProperty({
    description: 'Chemin du fichier uploadé',
    example: 'uploads/1234567890-filename.csv',
  })
  filepath!: string;

  @ApiProperty({
    description: 'Nom original du fichier',
    example: 'data.csv',
  })
  originalFilename!: string;

  @ApiProperty({
    description: "Message d'erreur si échec",
    example: null,
    required: false,
  })
  errorMessage?: string;

  @ApiProperty({
    description: 'Date de création',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'Date de début de traitement',
    example: null,
    required: false,
  })
  startedAt?: string;

  @ApiProperty({
    description: 'Date de fin de traitement',
    example: null,
    required: false,
  })
  finishedAt?: string;
}
