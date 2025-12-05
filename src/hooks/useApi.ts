import { useState, useEffect, useCallback } from 'react';

interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

interface ApiError {
  message: string;
  status?: number;
  details?: any;
}

export function useApi<T>(
  url: string,
  options?: RequestInit & { 
    enabled?: boolean;
    retry?: number;
    retryDelay?: number;
  }
): ApiResponse<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { enabled = true, retry = 3, retryDelay = 1000, ...requestOptions } = options || {};

  const fetchData = async (attempt = 1): Promise<void> => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...requestOptions?.headers,
        },
        ...requestOptions,
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({ 
          message: `HTTP ${response.status}: ${response.statusText}` 
        }));
        
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
      
      // Track successful API call
      if (typeof (window as any).trackAPICall === 'function') {
        (window as any).trackAPICall(url, 'success');
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);

      // Track failed API call
      if (typeof (window as any).trackAPICall === 'function') {
        (window as any).trackAPICall(url, 'error', errorMessage);
      }

      // Retry logic
      if (attempt < retry) {
        console.log(`Retry attempt ${attempt + 1} for ${url}`);
        setTimeout(() => {
          fetchData(attempt + 1);
        }, retryDelay * attempt);
      }
    } finally {
      setLoading(false);
    }
  };

  const refetch = useCallback(() => {
    fetchData();
  }, [url, JSON.stringify(requestOptions)]);

  useEffect(() => {
    fetchData();
  }, [url, JSON.stringify(requestOptions)]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}

// Specialized hooks for different API endpoints
export function useAnalysisData(analysisId: string) {
  return useApi(`/api/analyze/${analysisId}`, {
    retry: 2,
    retryDelay: 1500,
  });
}

export function useMarketData(symbol: string, timeframe: string = '1D') {
  return useApi(`/api/market/${symbol}?timeframe=${timeframe}`, {
    retry: 3,
    retryDelay: 2000,
  });
}

export function useSubscriptionData() {
  return useApi('/api/subscription', {
    retry: 1,
  });
}

// Mutation hook for POST/PUT/DELETE requests
export function useMutation<T = any>(
  url: string,
  options?: RequestInit
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const mutate = async (body?: any): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          message: `HTTP ${response.status}: ${response.statusText}` 
        }));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
      return result;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    mutate,
    loading,
    error,
    data,
  };
}