import { useState, useEffect } from 'react';

/**
 * Hook to detect window size and mobile breakpoint
 * @param {number} breakpoint - Pixel width to consider as mobile (default: 768)
 * @returns {boolean} true if window width is <= breakpoint
 */
function useWindowSize(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= breakpoint;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= breakpoint);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
}

export default useWindowSize;
