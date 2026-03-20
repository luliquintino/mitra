'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import type { Usuario } from '@/types';

interface AuthContextType {
  user: Usuario | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  register: (data: {
    nome: string;
    email: string;
    senha: string;
    telefone?: string;
    tipoUsuario?: string;
    dadosProfissionais?: Record<string, unknown>;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<Usuario>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('mitra_access_token');
    const cached = localStorage.getItem('mitra_user');

    if (!token) {
      setLoading(false);
      return;
    }

    if (cached) {
      try {
        setUser(JSON.parse(cached));
      } catch {}
    }

    try {
      const { data } = await authApi.me();
      setUser(data);
      localStorage.setItem('mitra_user', JSON.stringify(data));
    } catch {
      localStorage.removeItem('mitra_access_token');
      localStorage.removeItem('mitra_refresh_token');
      localStorage.removeItem('mitra_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email: string, senha: string) => {
    const { data } = await authApi.login(email, senha);
    localStorage.setItem('mitra_access_token', data.accessToken);
    localStorage.setItem('mitra_refresh_token', data.refreshToken);
    localStorage.setItem('mitra_user', JSON.stringify(data.usuario));
    setUser(data.usuario);
    router.push('/home');
  };

  const register = async (formData: {
    nome: string;
    email: string;
    senha: string;
    telefone?: string;
    tipoUsuario?: string;
    dadosProfissionais?: Record<string, unknown>;
  }) => {
    const { data } = await authApi.register(formData);
    localStorage.setItem('mitra_access_token', data.accessToken);
    localStorage.setItem('mitra_refresh_token', data.refreshToken);
    localStorage.setItem('mitra_user', JSON.stringify(data.usuario));
    setUser(data.usuario);
    router.push('/home');
  };

  const updateUser = useCallback((data: Partial<Usuario>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      localStorage.setItem('mitra_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {}
    localStorage.removeItem('mitra_access_token');
    localStorage.removeItem('mitra_refresh_token');
    localStorage.removeItem('mitra_user');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
