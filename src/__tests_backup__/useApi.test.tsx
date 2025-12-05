import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useApi, useAnalysisData, useMarketData } from '../hooks/useApi';

// Mock fetch
global.fetch = vi.fn();

describe('useApi Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle successful API calls', async () => {
    const mockData = { id: 1, name: 'Test Data' };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response);

    function TestComponent() {
      const { data, loading, error } = useApi('/api/test');
      
      return (
        <div>
          <div data-testid="loading">{loading ? 'true' : 'false'}</div>
          <div data-testid="error">{error || 'null'}</div>
          <div data-testid="data">{data ? JSON.stringify(data) : 'null'}</div>
        </div>
      );
    }

    render(<TestComponent />);

    expect(screen.getByTestId('loading')).toHaveTextContent('true');
    expect(screen.getByTestId('error')).toHaveTextContent('null');

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('data')).toHaveTextContent(JSON.stringify(mockData));
    });
  });

  it('should handle API errors', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({ message: 'Resource not found' }),
    } as Response);

    function TestComponent() {
      const { data, loading, error } = useApi('/api/test');
      
      return (
        <div>
          <div data-testid="loading">{loading ? 'true' : 'false'}</div>
          <div data-testid="error">{error || 'null'}</div>
          <div data-testid="data">{data ? JSON.stringify(data) : 'null'}</div>
        </div>
      );
    }

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('error')).toHaveTextContent('Resource not found');
      expect(screen.getByTestId('data')).toHaveTextContent('null');
    });
  });

  it('should retry failed requests', async () => {
    let attempts = 0;
    vi.mocked(fetch).mockImplementation(() => {
      attempts++;
      if (attempts < 3) {
        return Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: async () => ({ message: 'Server error' }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);
    });

    function TestComponent() {
      const { data, loading, error } = useApi('/api/test', { retry: 3, retryDelay: 100 });
      
      return (
        <div>
          <div data-testid="loading">{loading ? 'true' : 'false'}</div>
          <div data-testid="error">{error || 'null'}</div>
          <div data-testid="data">{data ? JSON.stringify(data) : 'null'}</div>
        </div>
      );
    }

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('data')).toHaveTextContent('{"success":true}');
      expect(screen.getByTestId('error')).toHaveTextContent('null');
    }, { timeout: 1000 });
  });

  it('should handle network errors', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

    function TestComponent() {
      const { data, loading, error } = useApi('/api/test');
      
      return (
        <div>
          <div data-testid="loading">{loading ? 'true' : 'false'}</div>
          <div data-testid="error">{error || 'null'}</div>
          <div data-testid="data">{data ? JSON.stringify(data) : 'null'}</div>
        </div>
      );
    }

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Network error');
      expect(screen.getByTestId('data')).toHaveTextContent('null');
    });
  });
});

describe('Specialized API Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle analysis data requests', async () => {
    const mockAnalysisData = { 
      id: '123',
      summary: { title: 'Test Analysis' },
      pestle: { factors: 6 }
    };
    
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockAnalysisData,
    } as Response);

    function TestComponent() {
      const { data, loading, error } = useAnalysisData('123');
      
      return (
        <div>
          <div data-testid="loading">{loading ? 'true' : 'false'}</div>
          <div data-testid="error">{error || 'null'}</div>
          <div data-testid="data">{data ? JSON.stringify(data) : 'null'}</div>
        </div>
      );
    }

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('data')).toHaveTextContent(JSON.stringify(mockAnalysisData));
    });

    expect(fetch).toHaveBeenCalledWith('/api/analyze/123', {
      headers: { 'Content-Type': 'application/json' },
      retry: 2,
      retryDelay: 1500,
    });
  });

  it('should handle market data requests', async () => {
    const mockMarketData = {
      symbol: 'AAPL',
      price: 150.25,
      change: 2.15
    };
    
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockMarketData,
    } as Response);

    function TestComponent() {
      const { data, loading, error } = useMarketData('AAPL', '1D');
      
      return (
        <div>
          <div data-testid="loading">{loading ? 'true' : 'false'}</div>
          <div data-testid="error">{error || 'null'}</div>
          <div data-testid="data">{data ? JSON.stringify(data) : 'null'}</div>
        </div>
      );
    }

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('data')).toHaveTextContent(JSON.stringify(mockMarketData));
    });

    expect(fetch).toHaveBeenCalledWith('/api/market/AAPL?timeframe=1D', {
      headers: { 'Content-Type': 'application/json' },
      retry: 3,
      retryDelay: 2000,
    });
  });
});

describe('useMutation Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle successful mutations', async () => {
    const mockResponse = { id: 1, status: 'success' };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    function TestComponent() {
      const { mutate, loading, error, data } = useMutation('/api/test');
      
      const handleSubmit = async () => {
        await mutate({ name: 'Test' });
      };
      
      return (
        <div>
          <button onClick={handleSubmit} data-testid="submit">Submit</button>
          <div data-testid="loading">{loading ? 'true' : 'false'}</div>
          <div data-testid="error">{error || 'null'}</div>
          <div data-testid="data">{data ? JSON.stringify(data) : 'null'}</div>
        </div>
      );
    }

    render(<TestComponent />);

    fireEvent.click(screen.getByTestId('submit'));

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('data')).toHaveTextContent(JSON.stringify(mockResponse));
    });

    expect(fetch).toHaveBeenCalledWith('/api/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test' }),
    });
  });

  it('should handle mutation errors', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => ({ message: 'Validation failed' }),
    } as Response);

    function TestComponent() {
      const { mutate, loading, error } = useMutation('/api/test');
      
      const handleSubmit = async () => {
        await mutate({ name: 'Test' });
      };
      
      return (
        <div>
          <button onClick={handleSubmit} data-testid="submit">Submit</button>
          <div data-testid="loading">{loading ? 'true' : 'false'}</div>
          <div data-testid="error">{error || 'null'}</div>
        </div>
      );
    }

    render(<TestComponent />);

    fireEvent.click(screen.getByTestId('submit'));

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('error')).toHaveTextContent('Validation failed');
    });
  });
});