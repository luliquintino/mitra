import { render, screen, waitFor } from '@testing-library/react';
import VisitantePetsPage from './page';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), back: jest.fn(), refresh: jest.fn(), prefetch: jest.fn() }),
  useParams: () => ({}),
  usePathname: () => '/visitante/pets',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/components/PetImage', () => ({
  PetImage: () => <div data-testid="pet-image">PetImage</div>,
}));

jest.mock('@/lib/utils', () => ({
  especieLabel: (e: string) => e,
}));

const mockPets = [
  { id: 'pet-1', nome: 'Luna', especie: 'CACHORRO', raca: 'Labrador', fotoUrl: null },
];

jest.mock('@/lib/api', () => ({
  visitantesApi: {
    listPets: jest.fn().mockResolvedValue({ data: mockPets }),
  },
}));

describe('VisitantePetsPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders pet cards after loading', async () => {
    render(<VisitantePetsPage />);
    await waitFor(() => {
      expect(screen.getByText('Luna')).toBeInTheDocument();
    });
  });

  it('shows empty state when no pets available', async () => {
    const { visitantesApi } = require('@/lib/api');
    visitantesApi.listPets.mockResolvedValueOnce({ data: [] });
    render(<VisitantePetsPage />);
    await waitFor(() => {
      expect(screen.getByText('Nenhum pet para acompanhar')).toBeInTheDocument();
    });
  });

  it('shows loading skeletons initially', () => {
    render(<VisitantePetsPage />);
    const skeletons = document.querySelectorAll('.pt-skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
