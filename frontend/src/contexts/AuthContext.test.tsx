import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { AuthProvider, useAuth } from './AuthContext';

// Mock the api module using the __mocks__ file
jest.mock('@/lib/api');
import { authApi } from '@/lib/api';

// Grab the mocked router.push so we can assert on it
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useParams: () => ({}),
  usePathname: () => '',
  useSearchParams: () => new URLSearchParams(),
}));

const fakeUser = {
  id: 'u1',
  nome: 'Test User',
  email: 'test@mitra.com',
  criadoEm: '2025-01-01T00:00:00Z',
};

function wrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    // By default, authApi.me rejects so loadUser finishes quickly
    (authApi.me as jest.Mock).mockRejectedValue(new Error('no token'));
  });

  // ─── login ───────────────────────────────────────────────────────────────────

  it('login: calls authApi.login, stores tokens, sets user, navigates to /home', async () => {
    (authApi.login as jest.Mock).mockResolvedValue({
      data: {
        accessToken: 'at-123',
        refreshToken: 'rt-456',
        usuario: fakeUser,
      },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@mitra.com', 'senha123');
    });

    expect(authApi.login).toHaveBeenCalledWith('test@mitra.com', 'senha123');
    expect(localStorage.getItem('mitra_access_token')).toBe('at-123');
    expect(localStorage.getItem('mitra_refresh_token')).toBe('rt-456');
    expect(localStorage.getItem('mitra_user')).toBe(JSON.stringify(fakeUser));
    expect(result.current.user).toEqual(fakeUser);
    expect(mockPush).toHaveBeenCalledWith('/home');
  });

  // ─── register ────────────────────────────────────────────────────────────────

  it('register: calls authApi.register, stores tokens, sets user, navigates to /home', async () => {
    (authApi.register as jest.Mock).mockResolvedValue({
      data: {
        accessToken: 'at-new',
        refreshToken: 'rt-new',
        usuario: fakeUser,
      },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    const formData = {
      nome: 'Test User',
      email: 'test@mitra.com',
      senha: 'senha123',
    };

    await act(async () => {
      await result.current.register(formData);
    });

    expect(authApi.register).toHaveBeenCalledWith(formData);
    expect(localStorage.getItem('mitra_access_token')).toBe('at-new');
    expect(localStorage.getItem('mitra_refresh_token')).toBe('rt-new');
    expect(result.current.user).toEqual(fakeUser);
    expect(mockPush).toHaveBeenCalledWith('/home');
  });

  // ─── logout ──────────────────────────────────────────────────────────────────

  it('logout: calls authApi.logout, clears localStorage, sets user null, navigates to /login', async () => {
    // Start logged in
    (authApi.logout as jest.Mock).mockResolvedValue({ data: {} });
    (authApi.login as jest.Mock).mockResolvedValue({
      data: {
        accessToken: 'at-123',
        refreshToken: 'rt-456',
        usuario: fakeUser,
      },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Login first
    await act(async () => {
      await result.current.login('test@mitra.com', 'senha123');
    });
    expect(result.current.user).toEqual(fakeUser);

    // Now logout
    await act(async () => {
      await result.current.logout();
    });

    expect(authApi.logout).toHaveBeenCalled();
    expect(localStorage.getItem('mitra_access_token')).toBeNull();
    expect(localStorage.getItem('mitra_refresh_token')).toBeNull();
    expect(localStorage.getItem('mitra_user')).toBeNull();
    expect(result.current.user).toBeNull();
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  // ─── loadUser: token present ─────────────────────────────────────────────────

  it('loadUser: if token in localStorage, calls authApi.me and sets user', async () => {
    localStorage.setItem('mitra_access_token', 'existing-token');
    (authApi.me as jest.Mock).mockResolvedValue({ data: fakeUser });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(authApi.me).toHaveBeenCalled();
    expect(result.current.user).toEqual(fakeUser);
  });

  // ─── loadUser: no token ──────────────────────────────────────────────────────

  it('loadUser: if no token, stays loading=false, user=null', async () => {
    // No token in localStorage (already cleared in beforeEach)
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(authApi.me).not.toHaveBeenCalled();
    expect(result.current.user).toBeNull();
  });

  // ─── isAuthenticated ─────────────────────────────────────────────────────────

  it('isAuthenticated: true when user set, false when null', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // No user yet
    expect(result.current.isAuthenticated).toBe(false);

    // Login to set user
    (authApi.login as jest.Mock).mockResolvedValue({
      data: {
        accessToken: 'at-123',
        refreshToken: 'rt-456',
        usuario: fakeUser,
      },
    });

    await act(async () => {
      await result.current.login('test@mitra.com', 'senha123');
    });

    expect(result.current.isAuthenticated).toBe(true);
  });

  // ─── updateUser ──────────────────────────────────────────────────────────────

  it('updateUser: merges partial data into existing user', async () => {
    (authApi.login as jest.Mock).mockResolvedValue({
      data: {
        accessToken: 'at-123',
        refreshToken: 'rt-456',
        usuario: fakeUser,
      },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@mitra.com', 'senha123');
    });

    act(() => {
      result.current.updateUser({ nome: 'Updated Name', telefone: '1199999' });
    });

    expect(result.current.user?.nome).toBe('Updated Name');
    expect(result.current.user?.telefone).toBe('1199999');
    expect(result.current.user?.email).toBe('test@mitra.com'); // preserved
    expect(JSON.parse(localStorage.getItem('mitra_user')!).nome).toBe(
      'Updated Name',
    );
  });
});
