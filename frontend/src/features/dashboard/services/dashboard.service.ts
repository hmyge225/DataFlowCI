import axios from 'axios';
import type { DashboardData } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const getDashboard = async (): Promise<DashboardData> => {
  const { data } = await axios.get<DashboardData>(`${API_URL}/dashboard`);
  return data;
};
