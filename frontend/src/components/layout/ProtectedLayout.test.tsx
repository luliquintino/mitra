import { render, screen } from '@testing-library/react';
import ProtectedLayout from './ProtectedLayout';

// Mock dependencies
const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/home',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

const mockUseAuth = jest.fn();
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('@/contexts/NotificacaoContext', () => ({
  useNotificacoes: () => ({ contNaoLidas: 0 }),
}));

jest.mock('@/components/ToastContainer', () => ({
  useToast: () => ({
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  }),
}));

describe('ProtectedLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading spinner when auth is loading', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: true,
      user: null,
      logout: jest.fn(),
    });
    const { container } = render(
      <ProtectedLayout>
        <p>Protected content</p>
      </ProtectedLayout>,
    );
    // Should show spinner, not content
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: { nome: 'Maria Silva', email: 'maria@test.com' },
      logout: jest.fn(),
    });
    render(
      <ProtectedLayout>
        <p>Protected content</p>
      </ProtectedLayout>,
    );
    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('redirects to /login when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: false,
      user: null,
      logout: jest.fn(),
    });
    render(
      <ProtectedLayout>
        <p>Protected content</p>
      </ProtectedLayout>,
    );
    expect(mockReplace).toHaveBeenCalledWith('/login');
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('shows user first name in the top bar when authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: { nome: 'Maria Silva', email: 'maria@test.com' },
      logout: jest.fn(),
    });
    render(
      <ProtectedLayout>
        <p>Content</p>
      </ProtectedLayout>,
    );
    expect(screen.getByText('Maria')).toBeInTheDocument();
  });
});
