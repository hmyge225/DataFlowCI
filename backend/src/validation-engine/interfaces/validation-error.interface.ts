export interface ValidationError {
  column: string;
  message: string;
  value?: unknown;
}

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

export interface ValidationSchema {
  fields: SchemaField[];
}
