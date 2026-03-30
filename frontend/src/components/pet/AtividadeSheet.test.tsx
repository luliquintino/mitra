import { render, screen } from '@testing-library/react';
import { AtividadeSheet } from './AtividadeSheet';
import { Evento } from '@/types';

describe('AtividadeSheet', () => {
  const mockOnClose = jest.fn();

  const sampleEventos: Evento[] = [
    {
      id: '1',
      petId: 'pet-1',
      tipo: 'VACINA',
      titulo: 'Vacina V10 aplicada',
      descricao: 'Dose de reforço',
      criadoEm: '2026-03-15T10:00:00Z',
    },
    {
      id: '2',
      petId: 'pet-1',
      tipo: 'CONSULTA',
      titulo: 'Consulta de rotina',
      criadoEm: '2026-03-20T14:30:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when closed', () => {
    const { container } = render(
      <AtividadeSheet open={false} onClose={mockOnClose} eventos={[]} />,
    );
    expect(container.querySelector('.fixed')).not.toBeInTheDocument();
  });

  it('renders the sheet title and event count when open', () => {
    render(
      <AtividadeSheet open={true} onClose={mockOnClose} eventos={sampleEventos} />,
    );
    expect(screen.getByText('Atividade')).toBeInTheDocument();
    expect(screen.getByText('2 eventos')).toBeInTheDocument();
  });

  it('renders event titles', () => {
    render(
      <AtividadeSheet open={true} onClose={mockOnClose} eventos={sampleEventos} />,
    );
    expect(screen.getByText('Vacina V10 aplicada')).toBeInTheDocument();
    expect(screen.getByText('Consulta de rotina')).toBeInTheDocument();
  });

  it('shows empty state when no events', () => {
    render(
      <AtividadeSheet open={true} onClose={mockOnClose} eventos={[]} />,
    );
    expect(screen.getByText('Linha do tempo vazia')).toBeInTheDocument();
  });

  it('renders event description when provided', () => {
    render(
      <AtividadeSheet open={true} onClose={mockOnClose} eventos={sampleEventos} />,
    );
    expect(screen.getByText('Dose de reforço')).toBeInTheDocument();
  });
});
