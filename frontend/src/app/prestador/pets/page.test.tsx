import { render, screen, waitFor } from '@testing-library/react';
import PrestadorPetsPage from './page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), refresh: jest.fn(), prefetch: jest.fn() }),
  useParams: () => ({}),
  usePathname: () => '/prestador/pets',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/components/PetImage', () => ({
  PetImage: () => <div data-testid="pet-image">PetImage</div>,
}));

jest.mock('@/lib/utils', () => ({
  especieLabel: (e: string) => e,
  petAge: () => '3 anos',
  formatDate: (d: string) => d,
}));

const mockPets = [
  { id: 'pet-1', nome: 'Luna', especie: 'CACHORRO', raca: 'Labrador', fotoUrl: null },
];

jest.mock('@/lib/api', () => ({
  prestadoresApi: {
    listPets: jest.fn().mockResolvedValue({ data: mockPets }),
  },
}));

describe('PrestadorPetsPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders pet cards after loading', async () => {
    render(<PrestadorPetsPage />);
    await waitFor(() => {
      expect(screen.getByText('Luna')).toBeInTheDocument();
    });
  });

  it('shows empty state when no pets assigned', async () => {
    const { prestadoresApi } = require('@/lib/api');
    prestadoresApi.listPets.mockResolvedValueOnce({ data: [] });
    render(<PrestadorPetsPage />);
    await waitFor(() => {
      expect(screen.getByText('Nenhum pet atribuído ainda')).toBeInTheDocument();
    });
  });

  it('shows error message when API fails', async () => {
    const { prestadoresApi } = require('@/lib/api');
    prestadoresApi.listPets.mockRejectedValueOnce({ response: { data: { message: 'Erro de servidor' } } });
    render(<PrestadorPetsPage />);
    await waitFor(() => {
      expect(screen.getByText('Erro de servidor')).toBeInTheDocument();
    });
  });
});
