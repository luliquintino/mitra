import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ConvitesPage from './page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), refresh: jest.fn(), prefetch: jest.fn() }),
  useParams: () => ({}),
  usePathname: () => '/visitante/convites',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/components/PetImage', () => ({
  PetImage: () => <div data-testid="pet-image">PetImage</div>,
}));

jest.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
  especieLabel: (e: string) => e,
}));

const mockConvites = [
  {
    id: 'conv-1',
    pet: { id: 'pet-1', nome: 'Luna', especie: 'CACHORRO', raca: 'Labrador', fotoUrl: null },
    tutorNome: 'Ana Souza',
    relacao: 'Amigo da familia',
    criadoEm: '2025-03-01T00:00:00Z',
  },
];

jest.mock('@/lib/api', () => ({
  visitantesApi: {
    listConvites: jest.fn().mockResolvedValue({ data: mockConvites }),
    acceptInvite: jest.fn().mockResolvedValue({}),
    rejectInvite: jest.fn().mockResolvedValue({}),
  },
}));

describe('ConvitesPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders pending invites after loading', async () => {
    render(<ConvitesPage />);
    await waitFor(() => {
      expect(screen.getByText('Luna')).toBeInTheDocument();
      expect(screen.getByText('1 convite pendente')).toBeInTheDocument();
    });
  });

  it('shows empty state when no invites', async () => {
    const { visitantesApi } = require('@/lib/api');
    visitantesApi.listConvites.mockResolvedValueOnce({ data: [] });
    render(<ConvitesPage />);
    await waitFor(() => {
      expect(screen.getByText('Nenhum convite pendente')).toBeInTheDocument();
    });
  });

  it('shows loading skeletons initially', () => {
    render(<ConvitesPage />);
    const skeletons = document.querySelectorAll('.pt-skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
