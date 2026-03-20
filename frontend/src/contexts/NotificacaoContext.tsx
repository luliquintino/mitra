'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { notificationsApi } from '@/lib/api';
import { notificationConfig } from '@/lib/config';
import type { Notificacao } from '@/types';

interface NotificacaoContextType {
  notificacoes: Notificacao[];
  contNaoLidas: number;
  loading: boolean;
  fetchNotificacoes: () => Promise<void>;
  marcarLida: (id: string) => Promise<void>;
  marcarTodasLidas: () => Promise<void>;
}

const NotificacaoContext = createContext<NotificacaoContextType>(
  {} as NotificacaoContextType,
);

export function NotificacaoProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [contNaoLidas, setContNaoLidas] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(
    null,
  );

  const fetchNotificacoes = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await notificationsApi.list();
      setNotificacoes(data);

      // Update count
      const naoLidas = data.filter((n: Notificacao) => !n.lida).length;
      setContNaoLidas(naoLidas);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const marcarLida = useCallback(
    async (id: string) => {
      try {
        await notificationsApi.read(id);
        // Update local state
        setNotificacoes((prev) =>
          prev.map((n) => (n.id === id ? { ...n, lida: true } : n)),
        );
        // Update count
        setContNaoLidas((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    },
    [],
  );

  const marcarTodasLidas = useCallback(async () => {
    try {
      await notificationsApi.readAll();
      // Update local state
      setNotificacoes((prev) =>
        prev.map((n) => ({ ...n, lida: true })),
      );
      // Update count
      setContNaoLidas(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, []);

  // Load notifications on mount
  useEffect(() => {
    fetchNotificacoes();
  }, [fetchNotificacoes]);

  // Set up polling for new notifications (configurable interval)
  useEffect(() => {
    const pollingTimer = setInterval(() => {
      fetchNotificacoes();
    }, notificationConfig.pollingInterval);

    setPollingInterval(pollingTimer);

    return () => {
      if (pollingTimer) clearInterval(pollingTimer);
    };
  }, [fetchNotificacoes]);

  return (
    <NotificacaoContext.Provider
      value={{
        notificacoes,
        contNaoLidas,
        loading,
        fetchNotificacoes,
        marcarLida,
        marcarTodasLidas,
      }}
    >
      {children}
    </NotificacaoContext.Provider>
  );
}

export function useNotificacoes() {
  const ctx = useContext(NotificacaoContext);
  if (!ctx)
    throw new Error(
      'useNotificacoes must be used within NotificacaoProvider',
    );
  return ctx;
}
