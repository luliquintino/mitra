import { render, screen, waitFor } from '@testing-library/react';
import PerfilPage from './page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), refresh: jest.fn(), prefetch: jest.fn() }),
  useParams: () => ({ id: 'pet-1' }),
  usePathname: () => '/pets/pet-1/perfil',
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

jest.mock('@/lib/api', () => ({
  petsApi: {
    get: jest.fn().mockResolvedValue({ data: mockPet }),
    update: jest.fn(),
  },
  governanceApi: {
    tutores: jest.fn().mockResolvedValue({ data: [] }),
    addTutor: jest.fn(),
  },
  usersApi: {
    searchByEmail: jest.fn(),
  },
  custodyApi: {
    solicitacoes: jest.fn().mockResolvedValue({ data: [] }),
    temporarias: jest.fn().mockResolvedValue({ data: [] }),
  },
  accessLogsApi: {
    list: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock('@/lib/mock-data', () => ({
  DEFAULT_PRESTADOR_SAUDE_PERMISSIONS: [],
}));

jest.mock('@/components/BottomSheet', () => ({
  BottomSheet: ({ children, open }: any) => open ? <div data-testid="bottom-sheet">{children}</div> : null,
}));

jest.mock('@/components/pet/CareCircle', () => ({
  CareCircle: () => <div data-testid="care-circle">CareCircle</div>,
}));

jest.mock('@/components/PetImage', () => ({
  PetImage: () => <div data-testid="pet-image">PetImage</div>,
}));

jest.mock('qrcode.react', () => ({
  QRCodeSVG: () => <svg data-testid="qr-code" />,
}));

describe('PerfilPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the pet profile after loading', async () => {
    render(<PerfilPage />);
    await waitFor(() => {
      expect(screen.getByText('Luna')).toBeInTheDocument();
    });
  });

  it('calls petsApi.get with the pet id', async () => {
    const { petsApi } = require('@/lib/api');
    render(<PerfilPage />);
    await waitFor(() => {
      expect(petsApi.get).toHaveBeenCalledWith('pet-1');
    });
  });

  it('renders without crashing when pet has minimal data', async () => {
    const { petsApi } = require('@/lib/api');
    petsApi.get.mockResolvedValueOnce({ data: { id: 'pet-2', nome: 'Rex', especie: 'CACHORRO' } });
    render(<PerfilPage />);
    await waitFor(() => {
      expect(screen.getByText('Rex')).toBeInTheDocument();
    });
  });
});
