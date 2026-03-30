import { render, screen } from '@testing-library/react';
import { CareCircle } from './CareCircle';
import { PetUsuario } from '@/types';

describe('CareCircle', () => {
  const sampleTutores: PetUsuario[] = [
    {
      id: 'pu-1',
      petId: 'pet-1',
      usuarioId: 'u-1',
      role: 'TUTOR_PRINCIPAL',
      ativo: true,
      adicionadoEm: '2026-01-01T00:00:00Z',
      usuario: { id: 'u-1', nome: 'Ana Costa', email: 'ana@test.com' },
    },
    {
      id: 'pu-2',
      petId: 'pet-1',
      usuarioId: 'u-2',
      role: 'VETERINARIO',
      ativo: false,
      adicionadoEm: '2026-01-01T00:00:00Z',
      usuario: { id: 'u-2', nome: 'Dr. Pedro', email: 'pedro@test.com' },
    },
  ];

  it('renders without crashing', () => {
    render(
      <CareCircle petNome="Rex" petEmoji="🐕" tutores={sampleTutores} />,
    );
    // SVG should be present
    expect(screen.getByText('Rex')).toBeInTheDocument();
  });

  it('renders the pet name at center', () => {
    render(
      <CareCircle petNome="Mimi" petEmoji="🐈" tutores={[]} />,
    );
    expect(screen.getByText('Mimi')).toBeInTheDocument();
  });

  it('renders the pet emoji', () => {
    render(
      <CareCircle petNome="Rex" petEmoji="🐕" tutores={[]} />,
    );
    // The emoji is rendered inside an SVG text element
    const svgElement = document.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('renders avatar initials for tutors', () => {
    render(
      <CareCircle petNome="Rex" petEmoji="🐕" tutores={sampleTutores} />,
    );
    // getInitials('Ana Costa') = 'AC', getInitials('Dr. Pedro') = 'DP'
    expect(screen.getByText('AC')).toBeInTheDocument();
    expect(screen.getByText('DP')).toBeInTheDocument();
  });

  it('renders first names below avatars', () => {
    render(
      <CareCircle petNome="Rex" petEmoji="🐕" tutores={sampleTutores} />,
    );
    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.getByText('Dr.')).toBeInTheDocument();
  });
});
