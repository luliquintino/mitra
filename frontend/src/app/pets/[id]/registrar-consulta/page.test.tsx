import { render } from '@testing-library/react';
import RegistrarConsultaRedirect from './page';

const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: mockReplace, back: jest.fn(), refresh: jest.fn(), prefetch: jest.fn() }),
  useParams: () => ({ id: 'pet-1' }),
  usePathname: () => '/pets/pet-1/registrar-consulta',
  useSearchParams: () => new URLSearchParams(),
}));

describe('RegistrarConsultaRedirect', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders nothing (returns null)', () => {
    const { container } = render(<RegistrarConsultaRedirect />);
    expect(container.innerHTML).toBe('');
  });

  it('redirects to the pet home page', () => {
    render(<RegistrarConsultaRedirect />);
    expect(mockReplace).toHaveBeenCalledWith('/pets/pet-1');
  });
});
