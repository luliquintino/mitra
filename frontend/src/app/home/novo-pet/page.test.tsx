import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NovoPetPage from './page';

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u1', nome: 'Ana Souza', email: 'ana@mitra.com' },
    loading: false,
    isAuthenticated: true,
    logout: jest.fn(),
    updateUser: jest.fn(),
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

jest.mock('@/components/ToastContainer', () => ({
  useToast: () => ({ success: jest.fn(), error: jest.fn() }),
}));

jest.mock('@/lib/api');
import { petsApi } from '@/lib/api';

describe('NovoPetPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders pet creation form with required fields', () => {
    render(<NovoPetPage />);
    expect(screen.getByText('Adicionar pet')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Luna, Mochi...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /adicionar pet/i })).toBeInTheDocument();
  });

  it('shows tutor principal badge', () => {
    render(<NovoPetPage />);
    expect(screen.getByText(/tutor principal/i)).toBeInTheDocument();
  });

  it('renders species and gender selects', () => {
    render(<NovoPetPage />);
    // The species select should have dog selected by default
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThanOrEqual(2);
  });

  it('submits form and shows success screen', async () => {
    (petsApi.create as jest.Mock).mockResolvedValue({
      data: {
        id: 'p1',
        nome: 'Luna',
        especie: 'CACHORRO',
        codigoPet: 'ABC123',
      },
    });

    render(<NovoPetPage />);

    fireEvent.change(screen.getByPlaceholderText('Luna, Mochi...'), {
      target: { value: 'Luna' },
    });
    fireEvent.click(screen.getByRole('button', { name: /adicionar pet/i }));

    await waitFor(() => {
      expect(screen.getByText('Luna cadastrado!')).toBeInTheDocument();
      expect(screen.getByText('ABC123')).toBeInTheDocument();
    });
  });

  it('shows error when creation fails', async () => {
    (petsApi.create as jest.Mock).mockRejectedValue({
      response: { data: { message: 'Nome obrigatório' } },
    });

    render(<NovoPetPage />);

    fireEvent.change(screen.getByPlaceholderText('Luna, Mochi...'), {
      target: { value: 'Luna' },
    });
    fireEvent.click(screen.getByRole('button', { name: /adicionar pet/i }));

    await waitFor(() => {
      expect(screen.getByText('Nome obrigatório')).toBeInTheDocument();
    });
  });
});
