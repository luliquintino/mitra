import { render, screen } from '@testing-library/react';
import { PricingTeaser } from './PricingTeaser';

describe('PricingTeaser', () => {
  it('renders without crashing', () => {
    render(<PricingTeaser />);
    expect(
      screen.getByText(/Seu pet merece o melhor cuidado/i),
    ).toBeInTheDocument();
  });

  it('displays the free pricing message', () => {
    render(<PricingTeaser />);
    expect(screen.getByText(/Comece agora/i)).toBeInTheDocument();
    expect(screen.getAllByText(/grátis/i).length).toBeGreaterThan(0);
  });

  it('renders CTA link to register', () => {
    render(<PricingTeaser />);
    const cta = screen.getByRole('link', { name: /Criar conta grátis/i });
    expect(cta).toHaveAttribute('href', '/register');
  });
});
