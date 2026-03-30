import { render, screen, fireEvent } from '@testing-library/react';
import { SaudeSheet } from './SaudeSheet';
import { Vacina, Medicamento } from '@/types';

jest.mock('@/lib/api', () => ({
  healthApi: {
    createVacina: jest.fn(),
    createMedicamento: jest.fn(),
    createSintoma: jest.fn(),
    administrarMedicamento: jest.fn(),
  },
}));

describe('SaudeSheet', () => {
  const mockOnClose = jest.fn();
  const mockOnUpdate = jest.fn();

  const sampleVacinas: Vacina[] = [
    {
      id: 'v-1',
      petId: 'pet-1',
      nome: 'V10',
      dataAplicacao: '2026-01-15',
      proximaDose: '2026-07-15',
      criadoEm: '2026-01-15T00:00:00Z',
    },
  ];

  const sampleMedicamentos: Medicamento[] = [
    {
      id: 'm-1',
      petId: 'pet-1',
      nome: 'Bravecto',
      dosagem: '1 comprimido',
      frequencia: 'A cada 3 meses',
      dataInicio: '2026-01-01',
      horarios: ['08:00'],
      status: 'ATIVO',
      criadoEm: '2026-01-01T00:00:00Z',
    },
  ];

  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    petId: 'pet-1',
    pet: { especie: 'CACHORRO' },
    vacinas: sampleVacinas,
    medicamentos: sampleMedicamentos,
    sintomas: [],
    onUpdate: mockOnUpdate,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when closed', () => {
    const { container } = render(
      <SaudeSheet {...defaultProps} open={false} />,
    );
    expect(container.querySelector('.fixed')).not.toBeInTheDocument();
  });

  it('renders the sheet title and sub-tabs', () => {
    render(<SaudeSheet {...defaultProps} />);
    expect(screen.getByText('Saude')).toBeInTheDocument();
    expect(screen.getByText(/Vacinas/)).toBeInTheDocument();
    expect(screen.getByText(/Medicamentos/)).toBeInTheDocument();
    expect(screen.getByText(/Sintomas/)).toBeInTheDocument();
  });

  it('shows vacina data in the default Vacinas tab', () => {
    render(<SaudeSheet {...defaultProps} />);
    expect(screen.getByText('V10')).toBeInTheDocument();
  });

  it('switches to Medicamentos tab', () => {
    render(<SaudeSheet {...defaultProps} />);
    fireEvent.click(screen.getByText(/Medicamentos/));
    expect(screen.getByText('Bravecto')).toBeInTheDocument();
  });
});
