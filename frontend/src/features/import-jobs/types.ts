export type ImportStatus = 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'PARTIAL' | 'FAILED';

export interface ImportJob {
  id: string;
  sourceId: string;
  schemaVersionId: string;
  status: ImportStatus;
  filepath: string;
  originalFilename: string;
  errorMessage?: string;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  source?: {
    id: string;
    name: string;
  };
  schemaVersion?: {
    id: string;
    version: number;
  };
  report?: {
    id: string;
    total: number;
    validCount: number;
    invalidCount: number;
  };
}
