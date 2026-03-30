import { render, screen, waitFor } from '@testing-library/react';
import HistoricoPage from './page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), refresh: jest.fn(), prefetch: jest.fn() }),
  useParams: () => ({ id: 'pet-1' }),
  usePathname: () => '/pets/pet-1/historico',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/lib/api', () => ({
  eventsApi: {
    historico: jest.fn().mockResolvedValue({ data: { eventos: [] } }),
  },
  accessLogsApi: {
    list: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
  formatDate: (d: string) => d,
  formatRelative: (d: string) => d,
  eventoIcon: () => '📋',
  getInitials: (n: string) => n?.charAt(0) || '?',
}));

describe('HistoricoPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the historico page with header', async () => {
    render(<HistoricoPage />);
    await waitFor(() => {
      expect(screen.getByText('Histórico')).toBeInTheDocument();
    });
  });

  it('shows Timeline and Diário sub-tabs', async () => {
    render(<HistoricoPage />);
    await waitFor(() => {
      expect(screen.getByText('Timeline')).toBeInTheDocument();
      expect(screen.getByText('Diário')).toBeInTheDocument();
    });
  });

  it('shows empty state when no events exist', async () => {
    render(<HistoricoPage />);
    await waitFor(() => {
      expect(screen.getByText('Linha do tempo vazia')).toBeInTheDocument();
      expect(screen.getByText('0 eventos')).toBeInTheDocument();
    });
  });
});
