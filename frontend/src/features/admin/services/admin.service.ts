import axios from 'axios';
import type { AdminUser, UserRole } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const getUsers = async (search?: string, role?: UserRole): Promise<AdminUser[]> => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (role) params.append('role', role);

  const { data } = await axios.get<AdminUser[]>(
    `${API_URL}/admin/users?${params.toString()}`,
  );
  return data;
};

export const updateUser = async (id: string, data: { role?: UserRole }): Promise<AdminUser> => {
  const { data: updatedUser } = await axios.patch<AdminUser>(
    `${API_URL}/admin/users/${id}`,
    data,
  );
  return updatedUser;
};

export const getAllSources = async (userId?: string) => {
  const params = new URLSearchParams();
  if (userId) params.append('userId', userId);

  const { data } = await axios.get(`${API_URL}/admin/sources?${params.toString()}`);
  return data;
};

export const getAllSchemas = async (sourceId?: string) => {
  const params = new URLSearchParams();
  if (sourceId) params.append('sourceId', sourceId);

  const { data } = await axios.get(`${API_URL}/admin/schemas?${params.toString()}`);
  return data;
};

export const getAllImportJobs = async (userId?: string, sourceId?: string, status?: string) => {
  const params = new URLSearchParams();
  if (userId) params.append('userId', userId);
  if (sourceId) params.append('sourceId', sourceId);
  if (status) params.append('status', status);

  const { data } = await axios.get(`${API_URL}/admin/import-jobs?${params.toString()}`);
  return data;
};

export const getPlatformStats = async () => {
  const { data } = await axios.get(`${API_URL}/admin/stats`);
  return data;
};
