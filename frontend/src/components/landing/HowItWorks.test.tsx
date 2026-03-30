import { render, screen } from '@testing-library/react';
import { HowItWorksSection } from './HowItWorksSection';

beforeAll(() => {
  const mockIntersectionObserver = jest.fn().mockReturnValue({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  });
  window.IntersectionObserver = mockIntersectionObserver as any;
});

describe('HowItWorksSection', () => {
  it('renders without crashing', () => {
    render(<HowItWorksSection />);
    expect(screen.getByText('Como funciona')).toBeInTheDocument();
  });

  it('renders all three steps', () => {
    render(<HowItWorksSection />);
    expect(screen.getByText('Cadastre seu pet')).toBeInTheDocument();
    expect(screen.getByText('Convide quem cuida')).toBeInTheDocument();
    expect(screen.getByText('Tudo organizado')).toBeInTheDocument();
  });

  it('renders step descriptions', () => {
    render(<HowItWorksSection />);
    expect(screen.getByText(/30 segundos/)).toBeInTheDocument();
    expect(screen.getByText(/Veterinário, passeador/i)).toBeInTheDocument();
    expect(screen.getByText(/num lugar só/)).toBeInTheDocument();
  });

  it('renders step numbers', () => {
    render(<HowItWorksSection />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
