import { render, screen, fireEvent } from '@testing-library/react';
import { Navbar } from './Navbar';

describe('Navbar', () => {
  it('renders without crashing', () => {
    render(<Navbar />);
    expect(screen.getAllByAltText('MITRA').length).toBeGreaterThanOrEqual(1);
  });

  it('renders login and register links (desktop)', () => {
    render(<Navbar />);
    const loginLinks = screen.getAllByText('Entrar');
    expect(loginLinks.length).toBeGreaterThanOrEqual(1);
    const registerLinks = screen.getAllByText(/Começar grátis/i);
    expect(registerLinks.length).toBeGreaterThanOrEqual(1);
  });

  it('has correct href on login link', () => {
    render(<Navbar />);
    const loginLinks = screen.getAllByRole('link', { name: /Entrar/i });
    expect(loginLinks[0]).toHaveAttribute('href', '/login');
  });

  it('toggles mobile menu on hamburger click', () => {
    render(<Navbar />);
    const hamburger = screen.getByLabelText('Abrir menu');
    fireEvent.click(hamburger);
    // After opening, close button should appear
    const closeButtons = screen.getAllByLabelText('Fechar menu');
    expect(closeButtons.length).toBeGreaterThanOrEqual(1);
  });
});
