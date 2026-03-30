import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { NotificacaoProvider, useNotificacoes } from './NotificacaoContext';

// Mock api module
jest.mock('@/lib/api');
import { notificationsApi } from '@/lib/api';

// Mock config to prevent real polling
jest.mock('@/lib/config', () => ({
  notificationConfig: {
    pollingInterval: 999_999_999, // effectively disable polling during tests
    toastDuration: 5000,
  },
  apiConfig: {
    baseUrl: 'http://localhost:3000/api/v1',
    requestTimeout: 4000,
  },
  featureConfig: {
    enableMockFallback: false,
  },
}));

const fakeNotificacoes = [
  {
    id: 'n1',
    usuarioId: 'u1',
    tipo: 'PET_UPDATE',
    titulo: 'Atualização do pet',
    mensagem: 'Rex foi atualizado',
    lida: false,
    criadoEm: '2025-06-01T10:00:00Z',
  },
  {
    id: 'n2',
    usuarioId: 'u1',
    tipo: 'CUSTODY',
    titulo: 'Guarda aprovada',
    mensagem: 'Sua solicitação foi aceita',
    lida: true,
    criadoEm: '2025-06-01T09:00:00Z',
  },
  {
    id: 'n3',
    usuarioId: 'u1',
    tipo: 'HEALTH',
    titulo: 'Vacina pendente',
    mensagem: 'Rex precisa de vacina',
    lida: false,
    criadoEm: '2025-06-01T08:00:00Z',
  },
];

function wrapper({ children }: { children: React.ReactNode }) {
  return <NotificacaoProvider>{children}</NotificacaoProvider>;
}

describe('NotificacaoContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: list returns fake data
    (notificationsApi.list as jest.Mock).mockResolvedValue({
      data: fakeNotificacoes,
    });
  });

  // ─── fetchNotificacoes ───────────────────────────────────────────────────────

  it('fetchNotificacoes: calls notificationsApi.list, sets notificacoes and contNaoLidas', async () => {
    const { result } = renderHook(() => useNotificacoes(), { wrapper });

    // On mount, fetchNotificacoes is called automatically
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(notificationsApi.list).toHaveBeenCalled();
    expect(result.current.notificacoes).toHaveLength(3);
    expect(result.current.contNaoLidas).toBe(2); // n1 and n3 are unread
  });

  // ─── marcarLida ──────────────────────────────────────────────────────────────

  it('marcarLida: calls notificationsApi.read, updates local state', async () => {
    (notificationsApi.read as jest.Mock).mockResolvedValue({ data: {} });

    const { result } = renderHook(() => useNotificacoes(), { wrapper });

    await waitFor(() => {
      expect(result.current.notificacoes).toHaveLength(3);
    });

    await act(async () => {
      await result.current.marcarLida('n1');
    });

    expect(notificationsApi.read).toHaveBeenCalledWith('n1');

    // n1 should now be marked as read
    const n1 = result.current.notificacoes.find((n) => n.id === 'n1');
    expect(n1?.lida).toBe(true);

    // Count should decrease by 1 (was 2, now 1)
    expect(result.current.contNaoLidas).toBe(1);
  });

  // ─── marcarTodasLidas ────────────────────────────────────────────────────────

  it('marcarTodasLidas: calls notificationsApi.readAll, sets all lida=true, contNaoLidas=0', async () => {
    (notificationsApi.readAll as jest.Mock).mockResolvedValue({ data: {} });

    const { result } = renderHook(() => useNotificacoes(), { wrapper });

    await waitFor(() => {
      expect(result.current.contNaoLidas).toBe(2);
    });

    await act(async () => {
      await result.current.marcarTodasLidas();
    });

    expect(notificationsApi.readAll).toHaveBeenCalled();
    expect(result.current.contNaoLidas).toBe(0);
    expect(result.current.notificacoes.every((n) => n.lida)).toBe(true);
  });

  // ─── unreadCount ─────────────────────────────────────────────────────────────

  it('unreadCount: correctly counts unread from list', async () => {
    // All unread
    const allUnread = fakeNotificacoes.map((n) => ({ ...n, lida: false }));
    (notificationsApi.list as jest.Mock).mockResolvedValue({
      data: allUnread,
    });

    const { result } = renderHook(() => useNotificacoes(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.contNaoLidas).toBe(3);
  });

  it('unreadCount: zero when all notifications are read', async () => {
    const allRead = fakeNotificacoes.map((n) => ({ ...n, lida: true }));
    (notificationsApi.list as jest.Mock).mockResolvedValue({
      data: allRead,
    });

    const { result } = renderHook(() => useNotificacoes(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.contNaoLidas).toBe(0);
  });
});
