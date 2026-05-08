import { useState, useEffect, useRef } from 'react';

/**
 * useScrollDirection - Tracks scroll on the actual scrollable container
 * Hides header on scroll down, shows on scroll up
 */
export function useScrollDirection(threshold = 20) {
  const [isVisible, setIsVisible] = useState(true);
  const scrollYRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    // The actual scroller is the <main> with data-scrollable, fallback to body
    const scroller = document.querySelector('[data-scrollable]') || document.body;

    const handleScroll = () => {
      const currentScrollY = scroller.scrollTop;
      const diff = currentScrollY - scrollYRef.current;

      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        if (diff > threshold && currentScrollY > 50) {
          setIsVisible(false);
        } else if (diff < -threshold || currentScrollY < 50) {
          setIsVisible(true);
        }
        scrollYRef.current = currentScrollY;
      }, 30);
    };

    scroller.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      scroller.removeEventListener('scroll', handleScroll);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [threshold]);

  return isVisible;
}