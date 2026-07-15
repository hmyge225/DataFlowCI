import { api } from '../../../shared/lib/api';
import type {
  SchemaVersion,
  CreateSchemaVersionInput,
} from '../types';

export async function getSchemaVersionsRequest(sourceId: string) {
  const { data } = await api.get<SchemaVersion[]>(
    `/sources/${sourceId}/schemas`,
  );
  return data;
}

export async function getSchemaVersionRequest(
  sourceId: string,
  version: number,
) {
  const { data } = await api.get<SchemaVersion>(
    `/sources/${sourceId}/schemas/${version}`,
  );
  return data;
}

export async function createSchemaVersionRequest(
  sourceId: string,
  input: CreateSchemaVersionInput,
) {
  const { data } = await api.post<SchemaVersion>(
    `/sources/${sourceId}/schemas`,
    input,
  );
  return data;
}
