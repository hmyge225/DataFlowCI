import { api, setAccessToken } from '../../../shared/lib/api';
import type { LoginInput, RegisterInput, CreateUserInput, Me } from '../schemas';

export async function registerRequest(input: RegisterInput) {
  const { data } = await api.post('/auth/register', input);
  return data as { message: string; userId: string };
}

// Réservé aux admins : crée un utilisateur avec le rôle choisi (USER ou ADMIN).
export async function createUserRequest(input: CreateUserInput) {
  const { data } = await api.post('/auth/users', input);
  return data as { message: string; userId: string };
}

export async function loginRequest(input: LoginInput) {
  const { data } = await api.post('/auth/login', input);
  setAccessToken(data.access_token);
  return data as { access_token: string };
}

export async function logoutRequest() {
  await api.post('/auth/logout');
  setAccessToken(null);
}

export async function refreshRequest() {
  const { data } = await api.post('/auth/refresh');
  setAccessToken(data.access_token);
  return data as { access_token: string };
}

export async function meRequest() {
  const { data } = await api.get('/auth/me');
  return data as Me;
}
