import { useState, useEffect } from 'react';

// Define screen size breakpoints
export const SCREEN_SIZES = {
  MOBILE: 'mobile',
  TABLET: 'tablet',
  DESKTOP: 'desktop',
};

// Define minimum widths for each screen size
const BREAKPOINTS = {
  MOBILE: 0,
  TABLET: 864,
  DESKTOP: 1024,
};

interface ScreenSizeState {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenSize: string;
}

/**
 * Custom hook to detect screen size and provide responsive information
 * @returns Current screen dimensions and size category
 */
export const useScreenSize = (): ScreenSizeState => {
  const [screenSize, setScreenSize] = useState<ScreenSizeState>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    screenSize: SCREEN_SIZES.DESKTOP,
  });

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Determine screen size category
      let currentSize;
      let isMobile = false;
      let isTablet = false;
      let isDesktop = false;

      if (width < BREAKPOINTS.TABLET) {
        currentSize = SCREEN_SIZES.MOBILE;
        isMobile = true;
      } else if (width < BREAKPOINTS.DESKTOP) {
        currentSize = SCREEN_SIZES.TABLET;
        isTablet = true;
      } else {
        currentSize = SCREEN_SIZES.DESKTOP;
        isDesktop = true;
      }

      setScreenSize({
        width,
        height,
        isMobile,
        isTablet,
        isDesktop,
        screenSize: currentSize,
      });
    };

    // Set initial size
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
};
