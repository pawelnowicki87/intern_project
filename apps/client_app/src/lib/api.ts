import axios from 'axios';
import { getAccessToken, setAccessToken } from './auth';

export const coreApi = axios.create({
  baseURL: process.env.CORE_SERVICE_URL ?? 'http://localhost:3001',
});

export const authApi = axios.create({
  baseURL: process.env.AUTH_SERVICE_URL ?? 'http://localhost:3002',
  withCredentials: true,
});

// tokeny tylko dla CORE API
coreApi.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// token dla AUTH API
authApi.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// automatyczne odświeżenie tokenu przy 401 dla AUTH API
authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !(originalRequest as any)._retry) {
      (originalRequest as any)._retry = true;
      try {
        const refreshRes = await authApi.post('/auth/refresh');
        const newAccess = refreshRes.data?.accessToken;
        if (newAccess) {
          setAccessToken(newAccess);
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${newAccess}`,
          };
          return authApi.request(originalRequest);
        }
      } catch {
      }
    }
    return Promise.reject(error);
  }
);

// automatyczne odświeżenie tokenu przy 401 dla CORE API
coreApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !(originalRequest as any)._retry) {
      (originalRequest as any)._retry = true;
      try {
        const refreshRes = await authApi.post('/auth/refresh');
        const newAccess = refreshRes.data?.accessToken;
        if (newAccess) {
          setAccessToken(newAccess);
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${newAccess}`,
          };
          return coreApi.request(originalRequest);
        }
      } catch {
      }
    }
    return Promise.reject(error);
  }
);
