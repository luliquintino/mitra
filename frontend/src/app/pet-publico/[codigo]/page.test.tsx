import { render, screen, waitFor } from '@testing-library/react';
import PetPublicoPage from './page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), refresh: jest.fn(), prefetch: jest.fn() }),
  useParams: () => ({ codigo: 'LUNA-123' }),
  usePathname: () => '/pet-publico/LUNA-123',
  useSearchParams: () => new URLSearchParams(),
}));

const mockPetLuna = {
  id: 'pet-luna',
  nome: 'Luna',
  especie: 'CACHORRO',
  raca: 'Labrador',
  genero: 'FEMEA',
  dataNascimento: '2020-06-15T00:00:00Z',
  peso: 25,
  codigoPet: 'LUNA-123',
};

jest.mock('@/lib/mock-data', () => ({
  mockPets: { 'pet-luna': mockPetLuna },
  mockVacinasLuna: [{ id: 'v1', nome: 'V8', dataAplicacao: '2024-01-10T00:00:00Z' }],
  mockVacinasThor: [],
  mockMedicamentosLuna: [],
  mockMedicamentosThor: [],
  mockPetUsuariosLuna: [
    { id: 'pu1', role: 'TUTOR_PRINCIPAL', ativo: true, usuario: { id: 'u1', nome: 'Ana Souza' } },
  ],
  mockPetUsuariosMochi: [],
  mockPetUsuariosThor: [],
  mockPetUsuariosNemo: [],
}));

jest.mock('@/lib/utils', () => ({
  formatDate: (d: string) => d,
  petAge: () => '4 anos',
  getInitials: (n: string) => n?.split(' ').map((w: string) => w[0]).join('').toUpperCase() || '?',
}));

describe('PetPublicoPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the public pet page with pet name', async () => {
    render(<PetPublicoPage />);
    await waitFor(() => {
      expect(screen.getByText('Luna')).toBeInTheDocument();
    });
  });

  it('shows not found when codigo does not match any pet', async () => {
    jest.spyOn(require('next/navigation'), 'useParams').mockReturnValue({ codigo: 'INVALID-999' });
    render(<PetPublicoPage />);
    await waitFor(() => {
      expect(screen.getByText('Pet não encontrado')).toBeInTheDocument();
    });
  });
});
