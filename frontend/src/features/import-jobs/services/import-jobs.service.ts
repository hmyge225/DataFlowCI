import { api } from '../../../shared/lib/api';
import type { ImportJob } from '../types';

export const getImportJobs = async (): Promise<ImportJob[]> => {
  const { data } = await api.get<ImportJob[]>('/import-jobs');
  return data;
};

export const getImportJob = async (id: string): Promise<ImportJob> => {
  const { data } = await api.get<ImportJob>(`/import-jobs/${id}`);
  return data;
};

export const deleteImportJob = async (id: string): Promise<void> => {
  await api.delete(`/import-jobs/${id}`);
};
