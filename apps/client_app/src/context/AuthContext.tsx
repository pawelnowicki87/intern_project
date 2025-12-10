"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { clearTokens, getAccessToken, setTokens } from "../lib/auth";
import { coreApi, authApi } from "../lib/api";

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    firstName: string;
    lastName: string;
    username: string;
    phone?: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.post("/auth/login", { email, password });
    setTokens(res.data.accessToken, res.data.refreshToken);
    const me = await coreApi.get("/users/auth", { params: { email } });
    setUser(me.data);
  };

  const register = async (data: {
    firstName: string;
    lastName: string;
    username: string;
    phone?: string;
    email: string;
    password: string;
  }) => {
    const res = await authApi.post("/auth/register", data);
    await login(data.email, data.password);
  };

  const logout = () => {
    clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be inside AuthProvider");
  return context;
};
