import { render, screen, waitFor } from '@testing-library/react';
import DiarioPage from './page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), refresh: jest.fn(), prefetch: jest.fn() }),
  useParams: () => ({ id: 'pet-1' }),
  usePathname: () => '/pets/pet-1/diario',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/lib/api', () => ({
  eventsApi: {
    historico: jest.fn().mockResolvedValue({ data: { eventos: [] } }),
  },
}));

jest.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('DiarioPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the diary page with title', async () => {
    render(<DiarioPage />);
    await waitFor(() => {
      expect(screen.getByText('Diário de Aventuras')).toBeInTheDocument();
    });
  });

  it('shows empty state when no events exist', async () => {
    render(<DiarioPage />);
    await waitFor(() => {
      expect(screen.getByText('Nenhuma aventura ainda!')).toBeInTheDocument();
    });
  });

  it('shows add photo button', async () => {
    render(<DiarioPage />);
    await waitFor(() => {
      expect(screen.getByText('Adicionar Nova Foto')).toBeInTheDocument();
    });
  });

  it('renders event cards when events exist', async () => {
    const { eventsApi } = require('@/lib/api');
    eventsApi.historico.mockResolvedValueOnce({
      data: [
        { id: 'e1', tipo: 'VISITA_REGISTRADA', descricao: 'Passeio no parque', criadoEm: '2025-03-01T10:00:00Z' },
      ],
    });
    render(<DiarioPage />);
    await waitFor(() => {
      expect(screen.getByText('Passeio no parque')).toBeInTheDocument();
    });
  });
});
