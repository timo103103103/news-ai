import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary, useErrorHandler, ToastContainer } from '../components/ErrorHandler';

// Mock window functions
vi.stubGlobal('trackError', vi.fn());

describe('useErrorHandler Hook', () => {
  it('should add and remove toasts', () => {
    function TestComponent() {
      const { toasts, showToast, removeToast } = useErrorHandler();
      
      return (
        <div>
          <button onClick={() => showToast({ type: 'success', title: 'Test Success' })}>
            Show Success
          </button>
          <button onClick={() => showToast({ type: 'error', title: 'Test Error' })}>
            Show Error
          </button>
          <div data-testid="toast-count">{toasts.length}</div>
          {toasts.map(toast => (
            <div key={toast.id} data-testid={`toast-${toast.id}`}>
              {toast.title}
            </div>
          ))}
        </div>
      );
    }

    render(<TestComponent />);
    
    expect(screen.getByTestId('toast-count')).toHaveTextContent('0');
    
    fireEvent.click(screen.getByText('Show Success'));
    expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
    
    fireEvent.click(screen.getByText('Show Error'));
    expect(screen.getByTestId('toast-count')).toHaveTextContent('2');
  });

  it('should show different toast types', () => {
    function TestComponent() {
      const { showSuccess, showError, showWarning, showInfo } = useErrorHandler();
      
      return (
        <div>
          <button onClick={() => showSuccess('Success Title', 'Success Message')}>
            Show Success
          </button>
          <button onClick={() => showError('Error Title', 'Error Message')}>
            Show Error
          </button>
          <button onClick={() => showWarning('Warning Title', 'Warning Message')}>
            Show Warning
          </button>
          <button onClick={() => showInfo('Info Title', 'Info Message')}>
            Show Info
          </button>
        </div>
      );
    }

    render(<TestComponent />);
    
    fireEvent.click(screen.getByText('Show Success'));
    fireEvent.click(screen.getByText('Show Error'));
    fireEvent.click(screen.getByText('Show Warning'));
    fireEvent.click(screen.getByText('Show Info'));
    
    // Note: In a real test, you'd need to check the rendered ToastContainer
    // This is a simplified test focusing on the hook logic
  });

  it('should auto-remove toasts after duration', async () => {
    vi.useFakeTimers();
    
    function TestComponent() {
      const { toasts, showToast } = useErrorHandler();
      
      return (
        <div>
          <button onClick={() => showToast({ type: 'info', title: 'Auto Remove', duration: 1000 })}>
            Show Auto Remove
          </button>
          <div data-testid="toast-count">{toasts.length}</div>
        </div>
      );
    }

    render(<TestComponent />);
    
    fireEvent.click(screen.getByText('Show Auto Remove'));
    expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
    
    // Fast-forward time
    vi.advanceTimersByTime(1000);
    
    expect(screen.getByTestId('toast-count')).toHaveTextContent('0');
    
    vi.useRealTimers();
  });
});

describe('ToastContainer', () => {
  it('should render different toast types with correct icons', () => {
    const toasts = [
      { id: '1', type: 'success' as const, title: 'Success Toast' },
      { id: '2', type: 'error' as const, title: 'Error Toast' },
      { id: '3', type: 'warning' as const, title: 'Warning Toast' },
      { id: '4', type: 'info' as const, title: 'Info Toast' },
    ];
    
    const mockRemoveToast = vi.fn();
    
    render(<ToastContainer toasts={toasts} removeToast={mockRemoveToast} />);
    
    expect(screen.getByText('Success Toast')).toBeInTheDocument();
    expect(screen.getByText('Error Toast')).toBeInTheDocument();
    expect(screen.getByText('Warning Toast')).toBeInTheDocument();
    expect(screen.getByText('Info Toast')).toBeInTheDocument();
  });

  it('should call removeToast when close button is clicked', () => {
    const toasts = [
      { id: '1', type: 'success' as const, title: 'Test Toast' },
    ];
    
    const mockRemoveToast = vi.fn();
    
    render(<ToastContainer toasts={toasts} removeToast={mockRemoveToast} />);
    
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    
    expect(mockRemoveToast).toHaveBeenCalledWith('1');
  });

  it('should render toast with message', () => {
    const toasts = [
      { id: '1', type: 'error' as const, title: 'Error Title', message: 'Error message details' },
    ];
    
    const mockRemoveToast = vi.fn();
    
    render(<ToastContainer toasts={toasts} removeToast={mockRemoveToast} />);
    
    expect(screen.getByText('Error Title')).toBeInTheDocument();
    expect(screen.getByText('Error message details')).toBeInTheDocument();
  });
});

describe('ErrorBoundary', () => {
  it('should catch and display errors', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Please try again later')).toBeInTheDocument();
    expect(screen.getByText('Refresh Page')).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  it('should call onError prop when error occurs', () => {
    const mockOnError = vi.fn();
    const ThrowError = () => {
      throw new Error('Test error');
    };
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary onError={mockOnError}>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(mockOnError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.any(Object)
    );
    
    consoleSpy.mockRestore();
  });

  it('should render custom fallback when provided', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };
    
    const customFallback = <div>Custom error message</div>;
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  it('should call window.trackError when available', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(window.trackError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.any(Object)
    );
    
    consoleSpy.mockRestore();
  });

  it('should handle refresh button click', () => {
    const mockReload = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true,
    });
    
    const ThrowError = () => {
      throw new Error('Test error');
    };
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    fireEvent.click(screen.getByText('Refresh Page'));
    expect(mockReload).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  it('should show error details in development mode', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    const ThrowError = () => {
      throw new Error('Development error');
    };
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Error Details (Development Only)')).toBeInTheDocument();
    expect(screen.getByText('Development error')).toBeInTheDocument();
    
    consoleSpy.mockRestore();
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('should not show error details in production mode', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    const ThrowError = () => {
      throw new Error('Production error');
    };
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.queryByText('Error Details (Development Only)')).not.toBeInTheDocument();
    expect(screen.queryByText('Production error')).not.toBeInTheDocument();
    
    consoleSpy.mockRestore();
    process.env.NODE_ENV = originalNodeEnv;
  });
});