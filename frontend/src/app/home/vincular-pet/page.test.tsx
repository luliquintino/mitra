import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VincularPetPage from './page';

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
  usePathname: () => '/home/vincular-pet',
  useSearchParams: () => new URLSearchParams(),
}));

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

jest.mock('@/components/PetImage', () => ({
  PetImage: ({ nome }: { nome: string }) => <div data-testid="pet-image">{nome}</div>,
}));

jest.mock('@/components/ToastContainer', () => ({
  useToast: () => ({ success: jest.fn(), error: jest.fn() }),
}));

jest.mock('@/lib/api');
import { petsApi } from '@/lib/api';

describe('VincularPetPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders code input and search button', () => {
    render(<VincularPetPage />);
    expect(screen.getByText('Vincular pet')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('ABC123')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /buscar/i })).toBeInTheDocument();
  });

  it('disables search button when code is too short', () => {
    render(<VincularPetPage />);
    const btn = screen.getByRole('button', { name: /buscar/i });
    expect(btn).toBeDisabled();
  });

  it('shows pet summary after successful search', async () => {
    (petsApi.findByCodigo as jest.Mock).mockResolvedValue({
      data: {
        nome: 'Luna',
        especie: 'CACHORRO',
        raca: 'Golden Retriever',
        tipoGuarda: 'INDIVIDUAL',
        tutorPrincipalCount: 1,
        maxTutorPrincipal: 1,
      },
    });

    render(<VincularPetPage />);

    fireEvent.change(screen.getByPlaceholderText('ABC123'), {
      target: { value: 'ABC123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /buscar/i }));

    await waitFor(() => {
      expect(screen.getByText('Pet encontrado')).toBeInTheDocument();
      expect(screen.getAllByText('Luna').length).toBeGreaterThan(0);
    });
  });

  it('shows error when pet code is not found', async () => {
    (petsApi.findByCodigo as jest.Mock).mockRejectedValue({
      response: { data: { message: 'Pet não encontrado' } },
    });

    render(<VincularPetPage />);

    fireEvent.change(screen.getByPlaceholderText('ABC123'), {
      target: { value: 'XXXXXX' },
    });
    fireEvent.click(screen.getByRole('button', { name: /buscar/i }));

    await waitFor(() => {
      expect(screen.getByText('Pet não encontrado')).toBeInTheDocument();
    });
  });

  it('navigates to pet page after successful vincular', async () => {
    (petsApi.findByCodigo as jest.Mock).mockResolvedValue({
      data: {
        nome: 'Luna',
        especie: 'CACHORRO',
        raca: 'Golden',
        tipoGuarda: 'INDIVIDUAL',
        tutorPrincipalCount: 1,
        maxTutorPrincipal: 1,
      },
    });
    (petsApi.vincularByCodigo as jest.Mock).mockResolvedValue({
      data: { petId: 'p1' },
    });

    render(<VincularPetPage />);

    // Search
    fireEvent.change(screen.getByPlaceholderText('ABC123'), {
      target: { value: 'ABC123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /buscar/i }));

    await waitFor(() => {
      expect(screen.getAllByText('Luna').length).toBeGreaterThan(0);
    });

    // Select role
    fireEvent.click(screen.getByText('Familiar'));

    // Vincular
    fireEvent.click(screen.getByRole('button', { name: /vincular a luna/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/pets/p1');
    });
  });
});
