import { useState, useEffect } from 'react';

/**
 * Hook to detect if the current device has a touchscreen
 * @returns {boolean} true if device has touchscreen capability
 */
function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      const hasTouch = 'ontouchstart' in window ||
                      navigator.maxTouchPoints > 0 ||
                      window.matchMedia('(pointer: coarse)').matches;
      setIsTouch(hasTouch);
    };

    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  return isTouch;
}

export default useIsTouchDevice;
