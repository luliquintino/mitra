import { render, screen, act } from '@testing-library/react';
import { ToastProvider, useToast } from './ToastContainer';

function TestConsumer() {
  const toast = useToast();
  return (
    <div>
      <button onClick={() => toast.success('Success toast', 'Details here')}>
        Add Success
      </button>
      <button onClick={() => toast.error('Error toast')}>Add Error</button>
    </div>
  );
}

describe('ToastContainer / ToastProvider', () => {
  it('renders children without toasts initially', () => {
    render(
      <ToastProvider>
        <p>Child content</p>
      </ToastProvider>,
    );
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('shows a toast when addToast is called via hook', () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>,
    );
    act(() => {
      screen.getByText('Add Success').click();
    });
    expect(screen.getByText('Success toast')).toBeInTheDocument();
    expect(screen.getByText('Details here')).toBeInTheDocument();
  });

  it('can render multiple toasts', () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>,
    );
    act(() => {
      screen.getByText('Add Success').click();
      screen.getByText('Add Error').click();
    });
    expect(screen.getByText('Success toast')).toBeInTheDocument();
    expect(screen.getByText('Error toast')).toBeInTheDocument();
  });

  it('throws when useToast is used outside provider', () => {
    // Suppress console.error for this test
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      render(<TestConsumer />);
    }).toThrow('useToast must be used within ToastProvider');
    spy.mockRestore();
  });
});
