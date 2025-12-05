import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useResponsive, useTouchDevice, useReducedMotion } from '../hooks/useResponsive';

// Mock window object
const mockWindow = {
  innerWidth: 1024,
  innerHeight: 768,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  matchMedia: vi.fn(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
  navigator: {
    maxTouchPoints: 0,
  },
};

// Set up global mocks
vi.stubGlobal('window', mockWindow);
vi.stubGlobal('navigator', mockWindow.navigator);

describe('useResponsive Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return correct initial state', () => {
    const { result } = renderHook(() => useResponsive());
    
    expect(result.current).toEqual({
      isMobile: false,
      isTablet: true,
      isDesktop: true,
      width: 1024,
      height: 768,
    });
  });

  it('should update state on window resize', () => {
    const { result } = renderHook(() => useResponsive());
    
    // Simulate window resize
    act(() => {
      mockWindow.innerWidth = 640;
      mockWindow.innerHeight = 480;
      
      // Trigger resize event
      const resizeCallback = mockWindow.addEventListener.mock.calls.find(
        call => call[0] === 'resize'
      )?.[1];
      
      if (resizeCallback) {
        resizeCallback();
      }
    });
    
    expect(result.current).toEqual({
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      width: 640,
      height: 480,
    });
  });

  it('should clean up event listeners on unmount', () => {
    const { unmount } = renderHook(() => useResponsive());
    
    const addEventListenerCalls = mockWindow.addEventListener.mock.calls.length;
    expect(addEventListenerCalls).toBeGreaterThan(0);
    
    unmount();
    
    const removeEventListenerCalls = mockWindow.removeEventListener.mock.calls.length;
    expect(removeEventListenerCalls).toBeGreaterThan(0);
  });

  it('should handle mobile breakpoints correctly', () => {
    mockWindow.innerWidth = 639; // Just below mobile breakpoint
    
    const { result } = renderHook(() => useResponsive());
    
    act(() => {
      const resizeCallback = mockWindow.addEventListener.mock.calls.find(
        call => call[0] === 'resize'
      )?.[1];
      
      if (resizeCallback) {
        resizeCallback();
      }
    });
    
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
  });

  it('should handle tablet breakpoints correctly', () => {
    mockWindow.innerWidth = 800; // Tablet range
    
    const { result } = renderHook(() => useResponsive());
    
    act(() => {
      const resizeCallback = mockWindow.addEventListener.mock.calls.find(
        call => call[0] === 'resize'
      )?.[1];
      
      if (resizeCallback) {
        resizeCallback();
      }
    });
    
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isDesktop).toBe(true);
  });

  it('should handle desktop breakpoints correctly', () => {
    mockWindow.innerWidth = 1280; // Desktop range
    
    const { result } = renderHook(() => useResponsive());
    
    act(() => {
      const resizeCallback = mockWindow.addEventListener.mock.calls.find(
        call => call[0] === 'resize'
      )?.[1];
      
      if (resizeCallback) {
        resizeCallback();
      }
    });
    
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);
  });
});

describe('useTouchDevice Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return false for non-touch devices', () => {
    mockWindow.ontouchstart = undefined;
    mockWindow.navigator.maxTouchPoints = 0;
    
    const { result } = renderHook(() => useTouchDevice());
    
    expect(result.current).toBe(false);
  });

  it('should return true for touch devices with ontouchstart', () => {
    mockWindow.ontouchstart = vi.fn();
    
    const { result } = renderHook(() => useTouchDevice());
    
    expect(result.current).toBe(true);
  });

  it('should return true for touch devices with maxTouchPoints', () => {
    mockWindow.ontouchstart = undefined;
    mockWindow.navigator.maxTouchPoints = 2;
    
    const { result } = renderHook(() => useTouchDevice());
    
    expect(result.current).toBe(true);
  });
});

describe('useReducedMotion Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return false when prefers-reduced-motion is not set', () => {
    mockWindow.matchMedia = vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    
    const { result } = renderHook(() => useReducedMotion());
    
    expect(result.current).toBe(false);
  });

  it('should return true when prefers-reduced-motion is set', () => {
    mockWindow.matchMedia = vi.fn(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    
    const { result } = renderHook(() => useReducedMotion());
    
    expect(result.current).toBe(true);
  });

  it('should handle media query changes', () => {
    let mediaQueryCallback: ((e: MediaQueryListEvent) => void) | null = null;
    
    mockWindow.matchMedia = vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn((event, callback) => {
        if (event === 'change') {
          mediaQueryCallback = callback;
        }
      }),
      removeEventListener: vi.fn(),
    }));
    
    const { result } = renderHook(() => useReducedMotion());
    
    expect(result.current).toBe(false);
    
    // Simulate media query change
    act(() => {
      if (mediaQueryCallback) {
        mediaQueryCallback({ matches: true } as MediaQueryListEvent);
      }
    });
    
    expect(result.current).toBe(true);
  });

  it('should clean up media query listeners on unmount', () => {
    const removeEventListenerMock = vi.fn();
    
    mockWindow.matchMedia = vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: removeEventListenerMock,
    }));
    
    const { unmount } = renderHook(() => useReducedMotion());
    
    unmount();
    
    expect(removeEventListenerMock).toHaveBeenCalled();
  });
});

describe('Responsive Helper Functions', () => {
  it('should return correct responsive classes', () => {
    const { getResponsiveClasses } = require('../hooks/useResponsive');
    
    const classes = getResponsiveClasses('mobile-class', 'tablet-class', 'desktop-class');
    expect(classes).toBe('mobile-class tablet-class desktop-class');
  });

  it('should handle missing optional classes', () => {
    const { getResponsiveClasses } = require('../hooks/useResponsive');
    
    const classes = getResponsiveClasses('mobile-class');
    expect(classes).toBe('mobile-class');
  });
});

describe('Chart Responsive Configs', () => {
  it('should have correct mobile configuration', () => {
    const { chartResponsiveConfigs } = require('../hooks/useResponsive');
    
    expect(chartResponsiveConfigs.mobile).toEqual({
      fontSize: 10,
      margin: { top: 5, right: 5, bottom: 5, left: 5 },
      height: 200
    });
  });

  it('should have correct tablet configuration', () => {
    const { chartResponsiveConfigs } = require('../hooks/useResponsive');
    
    expect(chartResponsiveConfigs.tablet).toEqual({
      fontSize: 11,
      margin: { top: 10, right: 10, bottom: 10, left: 10 },
      height: 250
    });
  });

  it('should have correct desktop configuration', () => {
    const { chartResponsiveConfigs } = require('../hooks/useResponsive');
    
    expect(chartResponsiveConfigs.desktop).toEqual({
      fontSize: 12,
      margin: { top: 20, right: 20, bottom: 20, left: 20 },
      height: 300
    });
  });
});

describe('Touch Target Sizes', () => {
  it('should have correct mobile touch target sizes', () => {
    const { touchTargetSizes } = require('../hooks/useResponsive');
    
    expect(touchTargetSizes.mobile).toEqual({
      minWidth: '44px',
      minHeight: '44px',
      padding: '12px'
    });
  });

  it('should have correct desktop touch target sizes', () => {
    const { touchTargetSizes } = require('../hooks/useResponsive');
    
    expect(touchTargetSizes.desktop).toEqual({
      minWidth: '32px',
      minHeight: '32px',
      padding: '8px'
    });
  });
});