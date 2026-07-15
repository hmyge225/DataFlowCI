import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty({
    description: "ID du job d'import créé",
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  importJobId!: string;

  @ApiProperty({
    description: 'Statut initial du job',
    example: 'PENDING',
  })
  status!: string;

  @ApiProperty({
    description: 'Message de confirmation',
    example: 'Fichier uploadé avec succès, traitement en cours',
  })
  message!: string;
}
