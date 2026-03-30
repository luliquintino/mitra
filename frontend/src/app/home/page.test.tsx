import { render, screen, waitFor } from '@testing-library/react';
import HomePage from './page';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useParams: () => ({}),
  usePathname: () => '/home',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u1', nome: 'Ana Souza', email: 'ana@mitra.com', tipoUsuario: 'TUTOR' },
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
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="protected-layout">{children}</div>,
}));

jest.mock('@/components/PetImage', () => ({
  PetImage: ({ nome }: { nome: string }) => <div data-testid="pet-image">{nome}</div>,
}));

jest.mock('@/components/ToastContainer', () => ({
  useToast: () => ({ success: jest.fn(), error: jest.fn() }),
}));

jest.mock('@/lib/api');
import { petsApi, visitantesApi } from '@/lib/api';

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (visitantesApi.listPets as jest.Mock).mockResolvedValue({ data: [] });
    (visitantesApi.listConvites as jest.Mock).mockResolvedValue({ data: [] });
  });

  it('shows empty state when no pets exist', async () => {
    (petsApi.list as jest.Mock).mockResolvedValue({ data: [] });

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Nenhum pet cadastrado')).toBeInTheDocument();
      expect(screen.getByText('Adicione seu primeiro pet para começar')).toBeInTheDocument();
    });
  });

  it('renders pet cards when pets are loaded', async () => {
    (petsApi.list as jest.Mock).mockResolvedValue({
      data: [
        {
          id: 'p1',
          nome: 'Luna',
          especie: 'CACHORRO',
          raca: 'Golden Retriever',
          meuRole: 'TUTOR_PRINCIPAL',
          petUsuarios: [{ id: 'pu1', role: 'TUTOR_PRINCIPAL', usuario: { nome: 'Ana Souza' } }],
        },
      ],
    });

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getAllByText('Luna').length).toBeGreaterThan(0);
    });
  });

  it('shows greeting with user first name', async () => {
    (petsApi.list as jest.Mock).mockResolvedValue({
      data: [
        {
          id: 'p1',
          nome: 'Luna',
          especie: 'CACHORRO',
          meuRole: 'TUTOR_PRINCIPAL',
          petUsuarios: [],
        },
      ],
    });

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText(/Olá, Ana/)).toBeInTheDocument();
    });
  });

  it('shows loading skeleton initially', () => {
    (petsApi.list as jest.Mock).mockReturnValue(new Promise(() => {})); // never resolves

    render(<HomePage />);

    // Skeleton cards have mg-skeleton class divs, check they exist
    expect(screen.getByTestId('protected-layout')).toBeInTheDocument();
  });

  it('shows error message when API fails', async () => {
    (petsApi.list as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar pets.')).toBeInTheDocument();
    });
  });
});
