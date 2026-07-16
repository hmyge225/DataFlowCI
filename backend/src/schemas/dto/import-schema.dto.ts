import {
  IsString,
  IsBoolean,
  IsNumber,
  IsArray,
  IsOptional,
  IsIn,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

const COLUMN_TYPES = [
  'string',
  'integer',
  'date',
  'boolean',
  'number',
  'enum',
] as const;
type ColumnType = (typeof COLUMN_TYPES)[number];

const FILE_FORMATS = ['csv', 'xlsx', 'xls'] as const;
type FileFormat = (typeof FILE_FORMATS)[number];

const ENCODINGS = ['utf-8', 'iso-8859-1', 'windows-1252'] as const;
type Encoding = (typeof ENCODINGS)[number];

const DELIMITERS = [',', ';', '\t', '|'] as const;
type Delimiter = (typeof DELIMITERS)[number];

class SchemaColumn {
  @IsString()
  @ApiProperty({ description: 'Nom de la colonne' })
  name!: string;

  @IsIn(COLUMN_TYPES)
  @ApiProperty({
    description: 'Type de données',
    enum: COLUMN_TYPES,
  })
  type!: ColumnType;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ description: 'Champ requis', required: false })
  required?: boolean;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Pattern regex pour validation', required: false })
  pattern?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Format de date (ex: DD/MM/YYYY)', required: false })
  format?: string;

  @IsArray()
  @IsOptional()
  @ApiProperty({ description: 'Valeurs autorisées pour type enum', required: false })
  allowed_values?: unknown[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  @ApiProperty({ description: 'Valeur minimale', required: false })
  min?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @ApiProperty({ description: 'Valeur maximale', required: false })
  max?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @ApiProperty({ description: 'Longueur minimale (string)', required: false })
  min_length?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @ApiProperty({ description: 'Longueur maximale (string)', required: false })
  max_length?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Description du champ', required: false })
  description?: string;
}

class RowConstraint {
  @IsString()
  @ApiProperty({ description: 'Nom de la contrainte' })
  name!: string;

  @IsString()
  @ApiProperty({ description: 'Description de la contrainte' })
  description!: string;
}

class SchemaDefinition {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SchemaColumn)
  @ApiProperty({ description: 'Colonnes du schéma', type: [SchemaColumn] })
  columns!: SchemaColumn[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RowConstraint)
  @IsOptional()
  @ApiProperty({
    description: 'Contraintes au niveau ligne',
    type: [RowConstraint],
    required: false,
  })
  row_constraints?: RowConstraint[];
}

export class ImportSchemaDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'ID de la source (optionnel, utilisé pour correspondance)',
    required: false,
  })
  source_id?: string;

  @IsString()
  @ApiProperty({ description: 'Nom de la source' })
  source_name!: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Description de la source', required: false })
  description?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Propriétaire de la source', required: false })
  owner?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @ApiProperty({ description: 'Version du schéma', required: false })
  version?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Fréquence attendue des imports', required: false })
  expected_frequency?: string;

  @IsIn(FILE_FORMATS)
  @IsOptional()
  @ApiProperty({
    description: 'Format de fichier attendu',
    enum: FILE_FORMATS,
    required: false,
  })
  file_format?: FileFormat;

  @IsIn(DELIMITERS)
  @IsOptional()
  @ApiProperty({
    description: 'Délimiteur CSV',
    enum: DELIMITERS,
    required: false,
  })
  delimiter?: Delimiter;

  @IsIn(ENCODINGS)
  @IsOptional()
  @ApiProperty({
    description: 'Encodage du fichier',
    enum: ENCODINGS,
    required: false,
  })
  encoding?: Encoding;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ description: 'Fichier avec en-têtes', required: false })
  has_header?: boolean;

  @ValidateNested()
  @Type(() => SchemaDefinition)
  @ApiProperty({ description: 'Définition du schéma', type: SchemaDefinition })
  schema!: SchemaDefinition;
}
