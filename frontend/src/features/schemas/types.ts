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
