import axios from "axios";
import { getAccessToken } from "./auth";

export const coreApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_CORE_API_URL ?? "http://localhost:3001",
});

export const authApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AUTH_API_URL ?? "http://localhost:3002",
});

// tokeny tylko dla CORE API
coreApi.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
