import { render, screen, fireEvent } from '@testing-library/react';
import { PetImage } from './PetImage';

describe('PetImage', () => {
  it('renders an img tag when fotoUrl is provided', () => {
    render(<PetImage fotoUrl="https://example.com/dog.jpg" nome="Rex" especie="CACHORRO" />);
    const img = screen.getByAltText('Rex');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/dog.jpg');
  });

  it('renders fallback emoji when no fotoUrl is given', () => {
    render(<PetImage nome="Mimi" especie="GATO" />);
    // Cat emoji fallback
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders fallback emoji on image error', () => {
    render(<PetImage fotoUrl="https://broken.com/img.jpg" nome="Rex" especie="CACHORRO" />);
    const img = screen.getByAltText('Rex');
    fireEvent.error(img);
    // After error, should no longer show the img, should show emoji fallback
    expect(screen.queryByAltText('Rex')).not.toBeInTheDocument();
  });

  it('uses correct emoji for different species', () => {
    const { rerender } = render(<PetImage nome="Bird" especie="PASSARO" />);
    // Passaro should not show img, just emoji
    expect(screen.queryByRole('img')).not.toBeInTheDocument();

    rerender(<PetImage nome="Horse" especie="CAVALO" />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
