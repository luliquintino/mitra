import { render, screen, fireEvent } from '@testing-library/react';
import { CalendarMonth } from './CalendarMonth';

describe('CalendarMonth', () => {
  const defaultProps = {
    month: 2, // March
    year: 2026,
    events: [] as { date: string; color?: string; label?: string }[],
    selectedDate: null,
    onSelectDate: jest.fn(),
    onChangeMonth: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the month name and year', () => {
    render(<CalendarMonth {...defaultProps} />);
    expect(screen.getByText('Março 2026')).toBeInTheDocument();
  });

  it('renders weekday headers', () => {
    render(<CalendarMonth {...defaultProps} />);
    expect(screen.getByText('Seg')).toBeInTheDocument();
    expect(screen.getByText('Dom')).toBeInTheDocument();
  });

  it('renders day numbers for the month', () => {
    render(<CalendarMonth {...defaultProps} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('31')).toBeInTheDocument();
  });

  it('calls onSelectDate when a day is clicked', () => {
    render(<CalendarMonth {...defaultProps} />);
    fireEvent.click(screen.getByText('10'));
    expect(defaultProps.onSelectDate).toHaveBeenCalledWith('2026-03-10');
  });

  it('calls onChangeMonth when navigation buttons are clicked', () => {
    render(<CalendarMonth {...defaultProps} />);
    const prevBtn = screen.getByLabelText('Mês anterior');
    const nextBtn = screen.getByLabelText('Próximo mês');

    fireEvent.click(prevBtn);
    expect(defaultProps.onChangeMonth).toHaveBeenCalledWith(1, 2026);

    fireEvent.click(nextBtn);
    expect(defaultProps.onChangeMonth).toHaveBeenCalledWith(3, 2026);
  });
});
