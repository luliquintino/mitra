import { render, screen, waitFor } from '@testing-library/react';
import AgendaPage from './page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), refresh: jest.fn(), prefetch: jest.fn() }),
  useParams: () => ({ id: 'pet-1' }),
  usePathname: () => '/pets/pet-1/agenda',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/lib/api', () => ({
  eventsApi: {
    historico: jest.fn().mockResolvedValue({ data: { eventos: [] } }),
  },
  compromissosApi: {
    list: jest.fn().mockResolvedValue({ data: [] }),
    create: jest.fn(),
    remove: jest.fn(),
  },
  healthApi: {
    vacinas: jest.fn().mockResolvedValue({ data: [] }),
    medicamentos: jest.fn().mockResolvedValue({ data: [] }),
  },
  custodyApi: {},
}));

jest.mock('@/components/CalendarMonth', () => ({
  CalendarMonth: () => <div data-testid="calendar-month">CalendarMonth</div>,
}));

jest.mock('@/components/BottomSheet', () => ({
  BottomSheet: ({ children, open }: any) => open ? <div data-testid="bottom-sheet">{children}</div> : null,
}));

jest.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
  formatDate: (d: string) => d,
}));

describe('AgendaPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the calendar component after loading', async () => {
    render(<AgendaPage />);
    await waitFor(() => {
      expect(screen.getByTestId('calendar-month')).toBeInTheDocument();
    });
  });

  it('shows empty state when no events on selected date', async () => {
    render(<AgendaPage />);
    await waitFor(() => {
      expect(screen.getByText('Nenhum evento nesta data')).toBeInTheDocument();
    });
  });

  it('shows empty state for compromissos', async () => {
    render(<AgendaPage />);
    await waitFor(() => {
      expect(screen.getByText('Nenhum compromisso cadastrado')).toBeInTheDocument();
    });
  });

  it('shows the new compromisso button', async () => {
    render(<AgendaPage />);
    await waitFor(() => {
      expect(screen.getByText('Novo compromisso')).toBeInTheDocument();
    });
  });
});
