import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Ensure window exists in node environment
if (typeof window === 'undefined') {
  // @ts-ignore
  global.window = {} as any;
}

// Mock window functions for analytics
// @ts-ignore
window.trackCTAClick = vi.fn();
// @ts-ignore
window.trackChartInteraction = vi.fn();
// @ts-ignore
window.trackPremiumView = vi.fn();
// @ts-ignore
window.trackAPICall = vi.fn();
// @ts-ignore
window.trackError = vi.fn();

// Mock IntersectionObserver
// @ts-ignore
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
// @ts-ignore
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock scrollTo
  Object.defineProperty(window, 'scrollTo', {
    writable: true,
    value: vi.fn(),
  });
}

// Mock fetch for API tests
// @ts-ignore
global.fetch = vi.fn();

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});