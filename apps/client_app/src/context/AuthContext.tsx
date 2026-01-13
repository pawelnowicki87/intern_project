'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { clearTokens, getAccessToken, setAccessToken } from '../lib/auth';
import { authApi, authApiPublic, coreApi } from '../lib/api';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  isPrivate: boolean;
  avatarUrl?: string | null;
  bio?: string | null;
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
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  loginWithGoogle: (idToken: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }

    const loadUser = async () => {
      try {
        const me = await authApi.get('/auth/me');
        const core = await coreApi.get('/users', {
          params: { email: me.data.email },
        });
        setUser(core.data);
      } catch {
        clearTokens();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApiPublic.post('/auth/login', {
      email,
      password,
    });

    setAccessToken(res.data.accessToken);

    const core = await coreApi.get('/users', {
      params: { email },
    });

    setUser(core.data);
  };

  const loginWithGoogle = async (idToken: string) => {
    try {
      const res = await authApiPublic.post('/auth/google/token', {
        idToken,
      });

      if (res.data.accessToken) {
        setAccessToken(res.data.accessToken);
      }

      const core = await coreApi.get('/users', {
        params: { email: res.data.user.email },
      });

      setUser(core.data);
    } catch (error) {
      console.error('Login with Google failed:', error);
      throw error;
    }
  };


  const register = async (data: {
    firstName: string;
    lastName: string;
    username: string;
    phone?: string;
    email: string;
    password: string;
  }) => {
    await authApiPublic.post('/auth/register', data);
    await login(data.email, data.password);
  };

  const logout = async () => {
    try {
      await authApi.post('/auth/logout');
    } catch {
      console.debug('logout failed');
    }
    clearTokens();
    setUser(null);
    router.push('/auth/login');
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, loginWithGoogle, register, logout, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be inside AuthProvider');
  return context;
};
