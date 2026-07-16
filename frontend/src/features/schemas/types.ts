export interface SchemaField {
  name: string;
  type: 'string' | 'integer' | 'date' | 'boolean' | 'number' | 'enum';
  required?: boolean;
  pattern?: string;
  enum?: unknown[];
  min?: number;
  max?: number;
  row_constraints?: {
    unique?: boolean;
    reference?: {
      sourceId: string;
      field: string;
    };
  };
}

export interface SchemaVersion {
  id: string;
  sourceId: string;
  version: number;
  fields: SchemaField[];
  createdAt: string;
}

export interface CreateSchemaVersionInput {
  fields: SchemaField[];
}

export interface RowConstraint {
  name: string;
  description?: string;
}

export interface SchemaColumn {
  name: string;
  type: 'string' | 'integer' | 'date' | 'boolean' | 'number' | 'enum';
  required?: boolean;
  pattern?: string;
  format?: string;
  allowed_values?: string[];
  min?: number;
  max?: number;
  min_length?: number;
  max_length?: number;
  description?: string;
}

export interface SchemaDefinition {
  columns: SchemaColumn[];
  row_constraints?: RowConstraint[];
}

export interface ImportSchemaInput {
  source_name: string;
  description?: string;
  version?: number;
  file_format?: string;
  delimiter?: string;
  encoding?: string;
  has_header?: boolean;
  expected_frequency?: string;
  schema: SchemaDefinition;
}
