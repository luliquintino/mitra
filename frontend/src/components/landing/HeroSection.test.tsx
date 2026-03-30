import { render, screen } from '@testing-library/react';
import { HeroSection } from './HeroSection';

describe('HeroSection', () => {
  it('renders without crashing', () => {
    render(<HeroSection />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('displays the main headline text', () => {
    render(<HeroSection />);
    expect(
      screen.getByText(/Todo o cuidado que seu pet merece/i),
    ).toBeInTheDocument();
  });

  it('displays the subtitle text', () => {
    render(<HeroSection />);
    expect(
      screen.getByText(/Saúde, agenda, guarda compartilhada/i),
    ).toBeInTheDocument();
  });

  it('renders the CTA link to register', () => {
    render(<HeroSection />);
    const ctaLink = screen.getByRole('link', { name: /Começar grátis/i });
    expect(ctaLink).toHaveAttribute('href', '/register');
  });

  it('renders the "Como funciona" anchor link', () => {
    render(<HeroSection />);
    const link = screen.getByText(/Como funciona/i);
    expect(link).toHaveAttribute('href', '#como-funciona');
  });
});
