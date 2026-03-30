import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from './page';

// Mock useAuth
const mockLogin = jest.fn();
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    user: null,
    loading: false,
    isAuthenticated: false,
  }),
}));

jest.mock('@/lib/api');

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders email and password inputs and submit button', () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('renders MITRA branding and feature pills', () => {
    render(<LoginPage />);
    expect(screen.getByText('MITRA')).toBeInTheDocument();
    expect(screen.getByText('Bem-vindo de volta')).toBeInTheDocument();
    expect(screen.getByText('Saúde')).toBeInTheDocument();
    expect(screen.getByText('Agenda')).toBeInTheDocument();
  });

  it('renders link to register page', () => {
    render(<LoginPage />);
    const link = screen.getByRole('link', { name: /criar conta/i });
    expect(link).toHaveAttribute('href', '/register');
  });

  it('calls login with email and password on submit', async () => {
    mockLogin.mockResolvedValue(undefined);
    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), {
      target: { value: 'ana@mitra.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: '123456' },
    });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('ana@mitra.com', '123456');
    });
  });

  it('shows error message when login fails', async () => {
    mockLogin.mockRejectedValue({
      response: { data: { message: 'Credenciais inválidas' } },
    });
    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), {
      target: { value: 'bad@email.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'wrong' },
    });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText('Credenciais inválidas')).toBeInTheDocument();
    });
  });
});
