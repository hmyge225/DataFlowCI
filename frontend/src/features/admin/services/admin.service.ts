import { api } from '../../../shared/lib/api';
import type { AdminUser, UserRole } from '../types';

export const getUsers = async (search?: string, role?: UserRole): Promise<AdminUser[]> => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (role) params.append('role', role);

  const { data } = await api.get<AdminUser[]>(
    `/admin/users?${params.toString()}`,
  );
  return data;
};

export const updateUser = async (id: string, data: { role?: UserRole }): Promise<AdminUser> => {
  const { data: updatedUser } = await api.patch<AdminUser>(
    `/admin/users/${id}`,
    data,
  );
  return updatedUser;
};

export const getAllSources = async (userId?: string) => {
  const params = new URLSearchParams();
  if (userId) params.append('userId', userId);

  const { data } = await api.get(`/admin/sources?${params.toString()}`);
  return data;
};

export const getAllSchemas = async (sourceId?: string) => {
  const params = new URLSearchParams();
  if (sourceId) params.append('sourceId', sourceId);

  const { data } = await api.get(`/admin/schemas?${params.toString()}`);
  return data;
};

export const getAllImportJobs = async (userId?: string, sourceId?: string, status?: string) => {
  const params = new URLSearchParams();
  if (userId) params.append('userId', userId);
  if (sourceId) params.append('sourceId', sourceId);
  if (status) params.append('status', status);

  const { data } = await api.get(`/admin/import-jobs?${params.toString()}`);
  return data;
};

export const getPlatformStats = async () => {
  const { data } = await api.get('/admin/stats');
  return data;
};
