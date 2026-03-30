import { render, screen, waitFor } from '@testing-library/react';
import SaudePage from './page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), refresh: jest.fn(), prefetch: jest.fn() }),
  useParams: () => ({ id: 'pet-1' }),
  usePathname: () => '/pets/pet-1/saude',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u1', nome: 'Ana Souza', email: 'ana@test.com', roles: ['TUTOR'] },
    loading: false,
  }),
}));

const mockVacinas = [
  { id: 'v1', nome: 'V8 (Polivalente)', dataAplicacao: '2024-01-10T00:00:00Z', proximaDose: '2025-01-10T00:00:00Z' },
];

const mockMedicamentos = [
  { id: 'm1', nome: 'Bravecto', dosagem: '1 comprimido', frequencia: 'Mensal', status: 'ATIVO' },
];

jest.mock('@/lib/api', () => ({
  petsApi: {
    get: jest.fn().mockResolvedValue({ data: { id: 'pet-1', nome: 'Luna', especie: 'CACHORRO' } }),
  },
  healthApi: {
    vacinas: jest.fn().mockResolvedValue({ data: mockVacinas }),
    medicamentos: jest.fn().mockResolvedValue({ data: mockMedicamentos }),
    sintomas: jest.fn().mockResolvedValue({ data: [] }),
    planoSaude: jest.fn().mockResolvedValue({ data: null }),
    getMuralPosts: jest.fn().mockResolvedValue({ data: [] }),
    recomendacoesVacinas: jest.fn().mockResolvedValue({ data: [] }),
    agendamentosVacinas: jest.fn().mockResolvedValue({ data: [] }),
  },
  compromissosApi: {
    list: jest.fn().mockResolvedValue({ data: [] }),
  },
}));

jest.mock('@/lib/mock-data', () => ({
  DEFAULT_PRESTADOR_SAUDE_PERMISSIONS: [],
}));

describe('SaudePage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders health page after loading', async () => {
    render(<SaudePage />);
    // The page fetches data and then renders tabs/sections
    await waitFor(() => {
      expect(screen.queryByText(/Vacina/i) || screen.queryByText(/Medicamento/i) || screen.queryByText(/Saúde/i)).toBeTruthy();
    });
  });

  it('calls health APIs with the pet id', async () => {
    const { healthApi } = require('@/lib/api');
    render(<SaudePage />);
    await waitFor(() => {
      expect(healthApi.vacinas).toHaveBeenCalledWith('pet-1');
      expect(healthApi.medicamentos).toHaveBeenCalledWith('pet-1');
    });
  });

  it('renders without crashing when API returns empty data', async () => {
    const { healthApi } = require('@/lib/api');
    healthApi.vacinas.mockResolvedValueOnce({ data: [] });
    healthApi.medicamentos.mockResolvedValueOnce({ data: [] });
    render(<SaudePage />);
    await waitFor(() => {
      expect(document.querySelector('.animate-fade-in') || document.querySelector('.space-y-6')).toBeTruthy();
    });
  });
});
