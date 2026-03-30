import { render, screen, waitFor } from '@testing-library/react';
import GuardaPage from './page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), refresh: jest.fn(), prefetch: jest.fn() }),
  useParams: () => ({ id: 'pet-1' }),
  usePathname: () => '/pets/pet-1/guarda',
  useSearchParams: () => new URLSearchParams(),
}));

const mockTutores = [
  {
    id: 'pu1',
    usuarioId: 'u1',
    role: 'TUTOR_PRINCIPAL',
    ativo: true,
    adicionadoEm: '2024-01-01T00:00:00Z',
    usuario: { id: 'u1', nome: 'Ana Souza', email: 'ana@test.com', avatarUrl: null },
  },
];

jest.mock('@/lib/api', () => ({
  governanceApi: {
    tutores: jest.fn().mockResolvedValue({ data: mockTutores }),
  },
  custodyApi: {
    solicitacoes: jest.fn().mockResolvedValue({ data: [] }),
    temporarias: jest.fn().mockResolvedValue({ data: [] }),
    responder: jest.fn(),
    criarTemporaria: jest.fn(),
    confirmarTemporaria: jest.fn(),
    cancelarTemporaria: jest.fn(),
  },
  eventsApi: {
    historico: jest.fn().mockResolvedValue({ data: { eventos: [] } }),
  },
}));

describe('GuardaPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the guarda page with section headers', async () => {
    render(<GuardaPage />);
    await waitFor(() => {
      expect(screen.getByText('Guarda')).toBeInTheDocument();
      expect(screen.getByText('Guarda Atual')).toBeInTheDocument();
    });
  });

  it('shows the main tutor when data loads', async () => {
    render(<GuardaPage />);
    await waitFor(() => {
      expect(screen.getByText('Ana Souza')).toBeInTheDocument();
      expect(screen.getByText('Tutor Principal')).toBeInTheDocument();
    });
  });

  it('shows empty states when no pending requests or temporary custody', async () => {
    render(<GuardaPage />);
    await waitFor(() => {
      expect(screen.getByText('Nenhuma solicitação pendente')).toBeInTheDocument();
      expect(screen.getByText('Nenhuma guarda temporária registrada')).toBeInTheDocument();
    });
  });

  it('shows empty event history', async () => {
    render(<GuardaPage />);
    await waitFor(() => {
      expect(screen.getByText('Nenhum evento de guarda registrado')).toBeInTheDocument();
    });
  });
});
