import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

const FIELD_TYPES = [
  'string',
  'integer',
  'date',
  'boolean',
  'number',
  'enum',
] as const;
type FieldType = (typeof FIELD_TYPES)[number];

class SchemaField {
  @IsString()
  name!: string;

  @IsIn(FIELD_TYPES)
  type!: FieldType;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsString()
  pattern?: string;

  @IsOptional()
  @IsArray()
  enum?: unknown[];

  @IsOptional()
  @IsNumber()
  min?: number;

  @IsOptional()
  @IsNumber()
  max?: number;

  @IsOptional()
  @IsObject()
  row_constraints?: {
    unique?: boolean;
    reference?: {
      sourceId: string;
      field: string;
    };
  };
}

export class CreateSchemaVersionDto {
  @ApiProperty({
    description:
      'Liste des champs du schéma de validation. Chaque champ contient name, type, required, pattern, enum, min, max, row_constraints.',
    example: [
      {
        name: 'email',
        type: 'string',
        required: true,
        pattern: '^\\S+@\\S+\\.\\S+$',
      },
      { name: 'age', type: 'integer', required: true, min: 0, max: 120 },
    ],
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'Le schéma doit contenir au moins un champ' })
  @ValidateNested({ each: true })
  @Type(() => SchemaField)
  fields!: SchemaField[];
}
