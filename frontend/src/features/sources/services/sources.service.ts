import { api } from '../../../shared/lib/api';
import type {
  Source,
  CreateSourceInput,
  UpdateSourceInput,
} from '../types';

export async function getSourcesRequest(userId?: string) {
  const params = userId ? { userId } : undefined;
  const { data } = await api.get<Source[]>('/sources', { params });
  return data;
}

export async function getSourceRequest(id: string) {
  const { data } = await api.get<Source>(`/sources/${id}`);
  return data;
}

export async function createSourceRequest(input: CreateSourceInput) {
  const { data } = await api.post<Source>('/sources', input);
  return data;
}

export async function updateSourceRequest(id: string, input: UpdateSourceInput) {
  const { data } = await api.patch<Source>(`/sources/${id}`, input);
  return data;
}

export async function deleteSourceRequest(id: string) {
  const { data } = await api.delete<Source>(`/sources/${id}`);
  return data;
}
