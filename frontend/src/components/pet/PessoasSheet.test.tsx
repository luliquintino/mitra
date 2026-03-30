import { render, screen, fireEvent } from '@testing-library/react';
import { PessoasSheet } from './PessoasSheet';
import { PetUsuario } from '@/types';

jest.mock('@/lib/api', () => ({
  governanceApi: {
    adicionarTutor: jest.fn(),
  },
  petsApi: {
    listVisitantes: jest.fn().mockResolvedValue({ data: [] }),
  },
}));

describe('PessoasSheet', () => {
  const mockOnClose = jest.fn();
  const mockOnUpdate = jest.fn();

  const sampleTutores: PetUsuario[] = [
    {
      id: 'pu-1',
      petId: 'pet-1',
      usuarioId: 'u-1',
      role: 'TUTOR_PRINCIPAL',
      ativo: true,
      adicionadoEm: '2026-01-01T00:00:00Z',
      usuario: { id: 'u-1', nome: 'Maria Souza', email: 'maria@test.com' },
    },
    {
      id: 'pu-2',
      petId: 'pet-1',
      usuarioId: 'u-2',
      role: 'VETERINARIO',
      ativo: true,
      adicionadoEm: '2026-01-01T00:00:00Z',
      usuario: { id: 'u-2', nome: 'Dr. Carlos', email: 'carlos@test.com' },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when closed', () => {
    const { container } = render(
      <PessoasSheet
        open={false}
        onClose={mockOnClose}
        petId="pet-1"
        tutores={sampleTutores}
        onUpdate={mockOnUpdate}
      />,
    );
    expect(container.querySelector('.fixed')).not.toBeInTheDocument();
  });

  it('renders the sheet title and sub-tabs when open', () => {
    render(
      <PessoasSheet
        open={true}
        onClose={mockOnClose}
        petId="pet-1"
        tutores={sampleTutores}
        onUpdate={mockOnUpdate}
      />,
    );
    expect(screen.getByText('Pessoas')).toBeInTheDocument();
    expect(screen.getByText('Tutores')).toBeInTheDocument();
    expect(screen.getByText(/Prestadores/)).toBeInTheDocument();
    expect(screen.getByText('Visitantes')).toBeInTheDocument();
  });

  it('renders tutor names in the default Tutores tab', () => {
    render(
      <PessoasSheet
        open={true}
        onClose={mockOnClose}
        petId="pet-1"
        tutores={sampleTutores}
        onUpdate={mockOnUpdate}
      />,
    );
    expect(screen.getByText('Maria Souza')).toBeInTheDocument();
    expect(screen.getByText('Dr. Carlos')).toBeInTheDocument();
  });

  it('switches to Prestadores tab and shows filtered list', () => {
    render(
      <PessoasSheet
        open={true}
        onClose={mockOnClose}
        petId="pet-1"
        tutores={sampleTutores}
        onUpdate={mockOnUpdate}
      />,
    );
    fireEvent.click(screen.getByText(/Prestadores/));
    // Dr. Carlos is VETERINARIO so should appear
    expect(screen.getByText('Dr. Carlos')).toBeInTheDocument();
  });

  it('shows invite button in Tutores tab', () => {
    render(
      <PessoasSheet
        open={true}
        onClose={mockOnClose}
        petId="pet-1"
        tutores={sampleTutores}
        onUpdate={mockOnUpdate}
      />,
    );
    expect(screen.getByText('+ Convidar')).toBeInTheDocument();
  });
});
