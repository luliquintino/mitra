import { render, screen, waitFor } from '@testing-library/react';
import PetHomePage from './page';

// ─── Mocks ──────────────────────────────────────────────────────────────────────

const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace, back: jest.fn(), refresh: jest.fn(), prefetch: jest.fn() }),
  useParams: () => ({ id: 'pet-1' }),
  usePathname: () => '/pets/pet-1',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u1', nome: 'Ana Souza', email: 'ana@test.com' },
    loading: false,
  }),
}));

jest.mock('@/lib/api', () => ({
  petsApi: {
    get: jest.fn().mockResolvedValue({
      data: {
        id: 'pet-1',
        nome: 'Luna',
        especie: 'CACHORRO',
        raca: 'Labrador',
        genero: 'FEMEA',
        dataNascimento: '2020-06-15T00:00:00Z',
        criadoEm: '2023-01-01T00:00:00Z',
        peso: 25,
      },
    }),
    dashboard: jest.fn().mockResolvedValue({
      data: { totalVacinas: 3, totalMedicamentos: 1, atividadeRecente: [] },
    }),
  },
  healthApi: {
    vacinas: jest.fn().mockResolvedValue({ data: [] }),
    medicamentos: jest.fn().mockResolvedValue({ data: [] }),
    getMuralPosts: jest.fn().mockResolvedValue({ data: [] }),
  },
  custodyApi: {},
  compromissosApi: {
    list: jest.fn().mockResolvedValue({ data: [] }),
  },
  governanceApi: {
    tutores: jest.fn().mockResolvedValue({ data: [] }),
  },
  eventsApi: {
    historico: jest.fn().mockResolvedValue({ data: { eventos: [] } }),
  },
  checkInApi: {
    getActive: jest.fn().mockResolvedValue(null),
  },
}));

jest.mock('@/components/CalendarMonth', () => ({
  CalendarMonth: () => <div data-testid="calendar-month">CalendarMonth</div>,
}));

jest.mock('@/components/RegisterEventModal', () => ({
  RegisterEventModal: () => null,
}));

// ─── Tests ──────────────────────────────────────────────────────────────────────

describe('PetHomePage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the pet dashboard after loading', async () => {
    render(<PetHomePage />);
    await waitFor(() => {
      // Pet name appears embedded in personality/humor text, not standalone
      expect(screen.getAllByText(/Luna/).length).toBeGreaterThan(0);
    });
  });

  it('shows loading skeleton initially', () => {
    render(<PetHomePage />);
    // During loading the component shows skeleton divs
    const container = document.querySelector('.space-y-4');
    expect(container).toBeTruthy();
  });

  it('calls all data-fetching APIs with the pet id', async () => {
    const { petsApi, healthApi, governanceApi, compromissosApi, eventsApi } = require('@/lib/api');
    render(<PetHomePage />);
    await waitFor(() => {
      expect(petsApi.get).toHaveBeenCalledWith('pet-1');
      expect(petsApi.dashboard).toHaveBeenCalledWith('pet-1');
      expect(governanceApi.tutores).toHaveBeenCalledWith('pet-1');
      expect(healthApi.vacinas).toHaveBeenCalledWith('pet-1');
      expect(healthApi.medicamentos).toHaveBeenCalledWith('pet-1');
      expect(compromissosApi.list).toHaveBeenCalledWith('pet-1');
    });
  });
});
