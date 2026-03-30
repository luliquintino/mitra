import { render, screen } from '@testing-library/react';
import { FeaturesSection } from './FeaturesSection';

// ScrollReveal uses IntersectionObserver — mock it
beforeAll(() => {
  const mockIntersectionObserver = jest.fn().mockReturnValue({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  });
  window.IntersectionObserver = mockIntersectionObserver as any;
});

describe('FeaturesSection', () => {
  it('renders without crashing', () => {
    render(<FeaturesSection />);
    expect(screen.getByText('Tudo que seu pet precisa')).toBeInTheDocument();
  });

  it('renders all four feature cards', () => {
    render(<FeaturesSection />);
    expect(screen.getByText('Saúde em dia')).toBeInTheDocument();
    expect(screen.getByText('Agenda organizada')).toBeInTheDocument();
    expect(screen.getByText('Guarda compartilhada')).toBeInTheDocument();
    expect(screen.getByText('Tudo registrado')).toBeInTheDocument();
  });

  it('renders bullet descriptions for each feature', () => {
    render(<FeaturesSection />);
    expect(screen.getByText(/Vacinas e doses/)).toBeInTheDocument();
    expect(screen.getByText(/Consultas marcadas/)).toBeInTheDocument();
    expect(screen.getByText(/Divisão entre tutores/)).toBeInTheDocument();
    expect(screen.getByText(/Timeline completa/)).toBeInTheDocument();
  });
});
