export interface Source {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };

  _count?: {
    schemaVersions: number;
    importJobs: number;
  };
  schemaVersions?: SchemaVersionRef[];
}

export interface SchemaVersionRef {
  id: string;
  sourceId: string;
  version: number;
  fields: unknown;
  createdAt: string;
}

export interface CreateSourceInput {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateSourceInput {
  name?: string;
  description?: string;
  isActive?: boolean;
}
