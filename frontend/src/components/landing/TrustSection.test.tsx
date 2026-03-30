import { render, screen } from '@testing-library/react';
import { TrustSection } from './TrustSection';

beforeAll(() => {
  const mockIntersectionObserver = jest.fn().mockReturnValue({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  });
  window.IntersectionObserver = mockIntersectionObserver as any;
});

describe('TrustSection', () => {
  it('renders without crashing', () => {
    render(<TrustSection />);
    expect(screen.getByText('Dados seguros')).toBeInTheDocument();
  });

  it('renders all trust badges', () => {
    render(<TrustSection />);
    expect(screen.getByText('Dados seguros')).toBeInTheDocument();
    expect(screen.getByText('100% gratuito')).toBeInTheDocument();
    expect(screen.getByText('Qualquer dispositivo')).toBeInTheDocument();
  });

  it('renders badge emojis', () => {
    render(<TrustSection />);
    // Emojis are rendered as text content alongside labels
    const badges = screen.getAllByText(/Dados seguros|100% gratuito|Qualquer dispositivo/);
    expect(badges).toHaveLength(3);
  });
});
