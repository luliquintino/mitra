import { render, screen } from '@testing-library/react';
import { Footer } from './Footer';

describe('Footer', () => {
  it('renders without crashing', () => {
    render(<Footer />);
    expect(screen.getByAltText('MITRA')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<Footer />);
    expect(screen.getByText('Entrar')).toBeInTheDocument();
    expect(screen.getByText('Criar conta')).toBeInTheDocument();
    expect(screen.getByText('Sobre')).toBeInTheDocument();
  });

  it('renders the copyright text', () => {
    render(<Footer />);
    expect(screen.getByText(/2026 MITRA/)).toBeInTheDocument();
  });

  it('renders the tagline', () => {
    render(<Footer />);
    expect(screen.getByText(/Feito com/)).toBeInTheDocument();
  });
});
