import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let isRefreshing = false;
let queue: Array<() => void> = [];

// Endpoints publics : un 401 sur ces routes signifie "identifiants invalides",
// pas "session expirée". Il ne faut donc jamais tenter un refresh ni rediriger.
const AUTH_ENDPOINTS_WITHOUT_RETRY = ['/auth/login', '/auth/register', '/auth/refresh'];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isPublicAuthEndpoint = AUTH_ENDPOINTS_WITHOUT_RETRY.some((url) =>
      originalRequest?.url?.includes(url),
    );

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isPublicAuthEndpoint
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        await new Promise<void>((resolve) => queue.push(resolve));
        return api(originalRequest);
      }

      isRefreshing = true;
      try {
        const { data } = await api.post('/auth/refresh');
        setAccessToken(data.access_token);
        queue.forEach((resolve) => resolve());
        queue = [];
        return api(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        queue = [];
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
