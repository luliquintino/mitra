import { render, screen, waitFor } from '@testing-library/react';
import EmergenciaPage from './page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), refresh: jest.fn(), prefetch: jest.fn() }),
  useParams: () => ({ id: 'pet-1' }),
  usePathname: () => '/pets/pet-1/emergencia',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u1', nome: 'Ana Souza', email: 'ana@test.com' },
    loading: false,
  }),
}));

const mockPet = {
  id: 'pet-1',
  nome: 'Luna',
  especie: 'CACHORRO',
  raca: 'Labrador',
  genero: 'FEMEA',
  dataNascimento: '2020-06-15T00:00:00Z',
  peso: 25,
  codigoPet: 'LUNA-123',
};

const mockTutores = [
  {
    id: 'pu1',
    role: 'TUTOR_PRINCIPAL',
    ativo: true,
    usuario: { id: 'u1', nome: 'Ana Souza', email: 'ana@test.com' },
  },
];

jest.mock('@/lib/api', () => ({
  petsApi: {
    get: jest.fn().mockResolvedValue({ data: mockPet }),
  },
  healthApi: {
    vacinas: jest.fn().mockResolvedValue({ data: [] }),
    medicamentos: jest.fn().mockResolvedValue({ data: [] }),
    planoSaude: jest.fn().mockResolvedValue({ data: null }),
  },
  governanceApi: {
    tutores: jest.fn().mockResolvedValue({ data: mockTutores }),
  },
}));

jest.mock('@/lib/utils', () => ({
  formatDate: (d: string) => d,
  petAge: () => '4 anos',
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
  getInitials: (n: string) => n?.split(' ').map((w: string) => w[0]).join('').toUpperCase() || '?',
}));

describe('EmergenciaPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the emergency banner and pet info', async () => {
    render(<EmergenciaPage />);
    await waitFor(() => {
      expect(screen.getByText('EMERGÊNCIA')).toBeInTheDocument();
      expect(screen.getByText('Luna')).toBeInTheDocument();
    });
  });

  it('shows medications section', async () => {
    render(<EmergenciaPage />);
    await waitFor(() => {
      expect(screen.getByText('Medicamentos ativos (0)')).toBeInTheDocument();
      expect(screen.getByText('Nenhum medicamento ativo')).toBeInTheDocument();
    });
  });

  it('shows contact section with tutor', async () => {
    render(<EmergenciaPage />);
    await waitFor(() => {
      expect(screen.getByText('Contatos')).toBeInTheDocument();
      expect(screen.getByText('Ana Souza')).toBeInTheDocument();
      expect(screen.getByText('Tutor principal')).toBeInTheDocument();
    });
  });
});
