import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MinhaContaPage from './page';

const mockLogout = jest.fn();
const mockUpdateUser = jest.fn();

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u1', nome: 'Ana Souza', email: 'ana@mitra.com', telefone: '11999990000' },
    loading: false,
    isAuthenticated: true,
    logout: mockLogout,
    updateUser: mockUpdateUser,
  }),
}));

jest.mock('@/contexts/NotificacaoContext', () => ({
  useNotificacoes: () => ({
    notificacoes: [],
    contNaoLidas: 0,
    loading: false,
    marcarLida: jest.fn(),
    marcarTodasLidas: jest.fn(),
  }),
}));

jest.mock('@/components/layout/ProtectedLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();
jest.mock('@/components/ToastContainer', () => ({
  useToast: () => ({ success: mockToastSuccess, error: mockToastError }),
}));

jest.mock('@/lib/api');
import { usersApi } from '@/lib/api';

describe('MinhaContaPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders user profile info', () => {
    render(<MinhaContaPage />);
    expect(screen.getByText('Ana Souza')).toBeInTheDocument();
    expect(screen.getByText('ana@mitra.com')).toBeInTheDocument();
  });

  it('renders personal data form fields', () => {
    render(<MinhaContaPage />);
    expect(screen.getByText('Dados pessoais')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Ana Souza')).toBeInTheDocument();
    expect(screen.getByDisplayValue('ana@mitra.com')).toBeInTheDocument();
  });

  it('renders account type radio options', () => {
    render(<MinhaContaPage />);
    expect(screen.getByText('Tipo de conta')).toBeInTheDocument();
    expect(screen.getByText(/Tutor de pet/)).toBeInTheDocument();
    expect(screen.getByText(/Prestador de serviços/)).toBeInTheDocument();
    expect(screen.getByText(/Visitante/)).toBeInTheDocument();
  });

  it('saves profile successfully', async () => {
    (usersApi.updateProfile as jest.Mock).mockResolvedValue({ data: {} });

    render(<MinhaContaPage />);

    fireEvent.change(screen.getByDisplayValue('Ana Souza'), {
      target: { value: 'Ana Maria Souza' },
    });
    fireEvent.click(screen.getByRole('button', { name: /salvar perfil/i }));

    await waitFor(() => {
      expect(usersApi.updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({ nome: 'Ana Maria Souza' }),
      );
      expect(mockToastSuccess).toHaveBeenCalledWith('Perfil atualizado com sucesso.');
      expect(mockUpdateUser).toHaveBeenCalled();
    });
  });

  it('shows error toast when save fails', async () => {
    (usersApi.updateProfile as jest.Mock).mockRejectedValue(new Error('fail'));

    render(<MinhaContaPage />);

    fireEvent.click(screen.getByRole('button', { name: /salvar perfil/i }));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Erro ao salvar. Tente novamente.');
    });
  });

  it('calls logout when logout button is clicked', () => {
    render(<MinhaContaPage />);
    fireEvent.click(screen.getByText('Sair da conta'));
    expect(mockLogout).toHaveBeenCalled();
  });
});
