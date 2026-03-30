import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterPage from './page';

const mockRegister = jest.fn();
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    register: mockRegister,
    user: null,
    loading: false,
    isAuthenticated: false,
  }),
}));

jest.mock('@/lib/api');

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders step 1 with basic data fields', () => {
    render(<RegisterPage />);
    expect(screen.getByText('Criar conta')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ana Souza')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Mínimo 8 caracteres/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /próximo/i })).toBeInTheDocument();
  });

  it('renders link to login page on step 1', () => {
    render(<RegisterPage />);
    const link = screen.getByRole('link', { name: /entrar/i });
    expect(link).toHaveAttribute('href', '/login');
  });

  it('shows error when password is too short on step 1 submit', async () => {
    render(<RegisterPage />);

    fireEvent.change(screen.getByPlaceholderText('Ana Souza'), {
      target: { value: 'Ana' },
    });
    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), {
      target: { value: 'ana@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Mínimo 8 caracteres/i), {
      target: { value: '123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /próximo/i }));

    await waitFor(() => {
      expect(screen.getByText(/senha deve ter pelo menos 8 caracteres/i)).toBeInTheDocument();
    });
  });

  it('advances to step 2 when step 1 is valid', async () => {
    render(<RegisterPage />);

    fireEvent.change(screen.getByPlaceholderText('Ana Souza'), {
      target: { value: 'Ana Souza' },
    });
    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), {
      target: { value: 'ana@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Mínimo 8 caracteres/i), {
      target: { value: '12345678' },
    });
    fireEvent.click(screen.getByRole('button', { name: /próximo/i }));

    await waitFor(() => {
      expect(screen.getByText('Tipo de usuário')).toBeInTheDocument();
      expect(screen.getByText('Sou Tutor')).toBeInTheDocument();
      expect(screen.getByText('Sou Prestador')).toBeInTheDocument();
      expect(screen.getByText('Ambos')).toBeInTheDocument();
    });
  });

  it('calls register when TUTOR is selected on step 2', async () => {
    mockRegister.mockResolvedValue(undefined);
    render(<RegisterPage />);

    // Fill step 1
    fireEvent.change(screen.getByPlaceholderText('Ana Souza'), {
      target: { value: 'Ana Souza' },
    });
    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), {
      target: { value: 'ana@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Mínimo 8 caracteres/i), {
      target: { value: '12345678' },
    });
    fireEvent.click(screen.getByRole('button', { name: /próximo/i }));

    // Step 2: select TUTOR
    await waitFor(() => {
      expect(screen.getByText('Sou Tutor')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Sou Tutor'));
    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        expect.objectContaining({
          nome: 'Ana Souza',
          email: 'ana@test.com',
          senha: '12345678',
          tipoUsuario: 'TUTOR',
        }),
      );
    });
  });
});
