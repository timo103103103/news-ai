import { useState, useEffect } from 'react';

interface ResponsiveConfig {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
}

const breakpoints = {
  mobile: 640,
  tablet: 1024,
  desktop: 1280
};

export function useResponsive(): ResponsiveConfig {
  const [config, setConfig] = useState<ResponsiveConfig>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    width: typeof window !== 'undefined' ? window.innerWidth : 1280,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setConfig({
        isMobile: width < breakpoints.mobile,
        isTablet: width >= breakpoints.mobile && width < breakpoints.tablet,
        isDesktop: width >= breakpoints.tablet,
        width,
        height
      });
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return config;
}

export function useTouchDevice(): boolean {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  return isTouchDevice;
}

export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

// Helper function to get responsive classes
export function getResponsiveClasses(
  mobile: string,
  tablet?: string,
  desktop?: string
): string {
  const classes = [mobile];
  
  if (tablet) classes.push(tablet);
  if (desktop) classes.push(desktop);
  
  return classes.join(' ');
}

// Chart responsive configurations
export const chartResponsiveConfigs = {
  mobile: {
    fontSize: 10,
    margin: { top: 5, right: 5, bottom: 5, left: 5 },
    height: 200
  },
  tablet: {
    fontSize: 11,
    margin: { top: 10, right: 10, bottom: 10, left: 10 },
    height: 250
  },
  desktop: {
    fontSize: 12,
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
    height: 300
  }
};

// Touch-friendly button sizes
export const touchTargetSizes = {
  mobile: {
    minWidth: '44px',
    minHeight: '44px',
    padding: '12px'
  },
  desktop: {
    minWidth: '32px',
    minHeight: '32px',
    padding: '8px'
  }
};