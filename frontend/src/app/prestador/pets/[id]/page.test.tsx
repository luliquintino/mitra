import { render, screen, waitFor } from '@testing-library/react';
import PrestadorPetDetailPage from './page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), refresh: jest.fn(), prefetch: jest.fn() }),
  useParams: () => ({ id: 'pet-1' }),
  usePathname: () => '/prestador/pets/pet-1',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u2', nome: 'Dr. Carlos', email: 'carlos@vet.com' },
    loading: false,
  }),
}));

jest.mock('@/lib/api', () => ({
  prestadoresApi: {
    getPet: jest.fn().mockResolvedValue({
      data: {
        id: 'pet-1',
        nome: 'Luna',
        especie: 'CACHORRO',
        raca: 'Labrador',
        genero: 'FEMEA',
        dataNascimento: '2020-06-15T00:00:00Z',
        peso: 25,
        profissao: 'VETERINARIO',
        permissoes: ['VISUALIZAR', 'DADOS_BASICOS', 'STATUS_SAUDE', 'HISTORICO_VACINACAO'],
      },
    }),
  },
  healthApi: {
    vacinas: jest.fn().mockResolvedValue({ data: [] }),
    medicamentos: jest.fn().mockResolvedValue({ data: [] }),
    sintomas: jest.fn().mockResolvedValue({ data: [] }),
  },
  registrosApi: {
    list: jest.fn().mockResolvedValue({ data: [] }),
    create: jest.fn(),
  },
  governanceApi: {
    tutores: jest.fn().mockResolvedValue({ data: [] }),
  },
  checkInApi: {
    getActive: jest.fn().mockResolvedValue(null),
    checkIn: jest.fn(),
    checkOut: jest.fn(),
  },
}));

jest.mock('@/components/PetImage', () => ({
  PetImage: () => <div data-testid="pet-image">PetImage</div>,
}));

jest.mock('@/lib/utils', () => ({
  especieLabel: (e: string) => e,
  generoLabel: (g: string) => g,
  petAge: () => '4 anos',
  formatDate: (d: string) => d,
  eventoIcon: () => '📋',
  formatRelative: (d: string) => d,
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

jest.mock('@/lib/smart-cards', () => ({
  generatePrestadorBriefing: () => [],
}));

describe('PrestadorPetDetailPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the pet detail page after loading', async () => {
    render(<PrestadorPetDetailPage />);
    await waitFor(() => {
      expect(screen.getByText('Luna')).toBeInTheDocument();
    });
  });

  it('calls prestadoresApi.getPet with the pet id', async () => {
    const { prestadoresApi } = require('@/lib/api');
    render(<PrestadorPetDetailPage />);
    await waitFor(() => {
      expect(prestadoresApi.getPet).toHaveBeenCalledWith('pet-1');
    });
  });
});
