import { render, screen, waitFor } from '@testing-library/react';
import VisitantePetDetailPage from './page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), refresh: jest.fn(), prefetch: jest.fn() }),
  useParams: () => ({ id: 'pet-1' }),
  usePathname: () => '/visitante/pets/pet-1',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u3', nome: 'Maria Visitante', email: 'maria@test.com' },
    loading: false,
  }),
}));

const mockPet = {
  id: 'pet-1',
  nome: 'Luna',
  especie: 'CACHORRO',
  raca: 'Labrador',
  fotoUrl: null,
  permissoes: ['DADOS_BASICOS', 'STATUS_SAUDE'],
};

jest.mock('@/lib/api', () => ({
  visitantesApi: {
    getPetDetail: jest.fn().mockResolvedValue({ data: mockPet }),
  },
  governanceApi: {
    tutores: jest.fn().mockResolvedValue({ data: [] }),
  },
  healthApi: {
    vacinas: jest.fn().mockResolvedValue({ data: [] }),
    medicamentos: jest.fn().mockResolvedValue({ data: [] }),
  },
  eventsApi: {
    historico: jest.fn().mockResolvedValue({ data: { eventos: [] } }),
  },
  registrosApi: {
    list: jest.fn().mockResolvedValue({ data: [] }),
  },
}));

jest.mock('@/components/PetImage', () => ({
  PetImage: () => <div data-testid="pet-image">PetImage</div>,
}));

jest.mock('@/lib/utils', () => ({
  especieLabel: (e: string) => e,
  petAge: () => '4 anos',
  eventoIcon: () => '📋',
  formatRelative: (d: string) => d,
}));

describe('VisitantePetDetailPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the pet detail after loading', async () => {
    render(<VisitantePetDetailPage />);
    await waitFor(() => {
      expect(screen.getByText('Luna')).toBeInTheDocument();
    });
  });

  it('calls visitantesApi.getPetDetail with the pet id', async () => {
    const { visitantesApi } = require('@/lib/api');
    render(<VisitantePetDetailPage />);
    await waitFor(() => {
      expect(visitantesApi.getPetDetail).toHaveBeenCalledWith('pet-1');
    });
  });
});
