import { useState, useEffect, useRef } from 'react';

/**
 * useScrollDirection - Tracks scroll direction and manages header visibility
 * Hides header on scroll down, shows on scroll up
 * Debounced and optimized for 60fps scrolling
 */
export function useScrollDirection(threshold = 20) {
  const [isVisible, setIsVisible] = useState(true);
  const scrollYRef = useRef(0);
  const debounceTimeoutRef = useRef(null);

  useEffect(() => {
    let rafId = null;

    const getScrollY = () => document.documentElement.scrollTop || document.body.scrollTop;

    const handleScroll = () => {
      const currentScrollY = getScrollY();
      const scrollDiff = currentScrollY - scrollYRef.current;

      // Clear existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Debounce the visibility update
      debounceTimeoutRef.current = setTimeout(() => {
        // Scrolling down more than threshold
        if (scrollDiff > threshold && currentScrollY > 50) {
          setIsVisible(false);
        }
        // Scrolling up
        else if (scrollDiff < -threshold || currentScrollY < 50) {
          setIsVisible(true);
        }

        scrollYRef.current = currentScrollY;
      }, 50);
    };

    // Listen on document since html has overflow:hidden and body is the scroller
    document.addEventListener('scroll', handleScroll, { passive: true });
    document.body.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('scroll', handleScroll);
      document.body.removeEventListener('scroll', handleScroll);
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [threshold]);

  return isVisible;
}