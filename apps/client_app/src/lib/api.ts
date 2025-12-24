import axios from 'axios';
import { getAccessToken, setAccessToken, clearTokens } from './auth';

export const authApiPublic = axios.create({
  baseURL: process.env.AUTH_SERVICE_URL ?? 'http://localhost:3002',
  withCredentials: true,
});

export const authApi = axios.create({
  baseURL: process.env.AUTH_SERVICE_URL ?? 'http://localhost:3002',
  withCredentials: true,
});

export const coreApi = axios.create({
  baseURL: process.env.CORE_SERVICE_URL ?? 'http://localhost:3001',
});

const AUTH_ROUTES = ['/auth/login', '/auth/register', '/auth/refresh'];

authApi.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

coreApi.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const handle401 = async (error: any, api: any) => {
  const originalRequest = error.config;

  if (
    error.response?.status === 401 &&
    !(originalRequest as any)._retry &&
    !AUTH_ROUTES.some((r) => originalRequest.url?.includes(r))
  ) { 
    (originalRequest as any)._retry = true;

    try {
      const refreshRes = await authApiPublic.post('/auth/refresh');
      const newAccess = refreshRes.data?.accessToken;

      if (newAccess) {
        setAccessToken(newAccess);
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api.request(originalRequest);
      }
    } catch {
      clearTokens();
    }
  }

  return Promise.reject(error);
};

authApi.interceptors.response.use(
  (response) => response,
  (error) => handle401(error, authApi),
);

coreApi.interceptors.response.use(
  (response) => response,
  (error) => handle401(error, coreApi),
);
