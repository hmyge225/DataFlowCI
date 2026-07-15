import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSourceDto {
  @ApiProperty({
    example: 'Clients Q3 2024 (updated)',
    description: 'Nouveau nom de la source',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiProperty({
    example: 'Description mise à jour',
    description: 'Nouvelle description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: false,
    description: 'État actif/inactif',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
