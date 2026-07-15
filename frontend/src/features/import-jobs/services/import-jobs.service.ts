import axios from 'axios';
import type { ImportJob } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const getImportJobs = async (): Promise<ImportJob[]> => {
  const { data } = await axios.get<ImportJob[]>(`${API_URL}/import-jobs`);
  return data;
};

export const getImportJob = async (id: string): Promise<ImportJob> => {
  const { data } = await axios.get<ImportJob>(`${API_URL}/import-jobs/${id}`);
  return data;
};

export const deleteImportJob = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/import-jobs/${id}`);
};
