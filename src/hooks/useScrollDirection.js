import { useState, useEffect, useRef } from 'react';

/**
 * useScrollDirection
 * Uses rAF for 60fps smooth tracking on document.body (the actual scroller).
 */
export function useScrollDirection(threshold = 8) {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const current = document.body.scrollTop || document.documentElement.scrollTop;
        const diff = current - lastScrollY.current;

        if (diff > threshold && current > 60) {
          setIsVisible(false);
        } else if (diff < -threshold || current < 60) {
          setIsVisible(true);
        }

        lastScrollY.current = current;
        ticking.current = false;
      });
    };

    // Body is the scroller (html: overflow hidden, body: overflow-y auto)
    document.body.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      document.body.removeEventListener('scroll', onScroll);
    };
  }, [threshold]);

  return isVisible;
}