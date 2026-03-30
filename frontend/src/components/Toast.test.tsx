import { render, screen, fireEvent } from '@testing-library/react';
import { Toast } from './Toast';

describe('Toast', () => {
  const defaultProps = {
    id: 'toast-1',
    type: 'success' as const,
    title: 'Sucesso!',
    message: 'Operação realizada.',
    duration: 0, // disable auto-close for tests
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title and message', () => {
    render(<Toast {...defaultProps} />);
    expect(screen.getByText('Sucesso!')).toBeInTheDocument();
    expect(screen.getByText('Operação realizada.')).toBeInTheDocument();
  });

  it('renders with role="alert"', () => {
    render(<Toast {...defaultProps} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    jest.useFakeTimers();
    render(<Toast {...defaultProps} />);
    const closeBtn = screen.getByLabelText('Fechar');
    fireEvent.click(closeBtn);
    jest.advanceTimersByTime(300);
    expect(defaultProps.onClose).toHaveBeenCalledWith('toast-1');
    jest.useRealTimers();
  });

  it('renders without message when message is undefined', () => {
    render(<Toast {...defaultProps} message={undefined} />);
    expect(screen.getByText('Sucesso!')).toBeInTheDocument();
    expect(screen.queryByText('Operação realizada.')).not.toBeInTheDocument();
  });

  it('renders different toast types', () => {
    const { rerender } = render(<Toast {...defaultProps} type="error" title="Erro!" />);
    expect(screen.getByText('Erro!')).toBeInTheDocument();

    rerender(<Toast {...defaultProps} type="warning" title="Atenção!" />);
    expect(screen.getByText('Atenção!')).toBeInTheDocument();

    rerender(<Toast {...defaultProps} type="info" title="Info" />);
    expect(screen.getByText('Info')).toBeInTheDocument();
  });
});
