import { api } from '../../../shared/lib/api';
import type { DashboardData } from '../types';

export const getDashboard = async (): Promise<DashboardData> => {
  const { data } = await api.get<DashboardData>('/dashboard');
  return data;
};
