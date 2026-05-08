import { useRef, useCallback, useEffect } from 'react';

/**
 * Prevents accidental navigation during scroll with touch delay threshold.
 * Returns touch handlers that block taps if user scrolled during touch.
 */
export function useScrollOptimization(tapHandler, threshold = 10) {
  const touchStartY = useRef(0);
  const scrolledDistance = useRef(0);
  const scrollStartPos = useRef(0);

  const onTouchStart = useCallback((e) => {
    touchStartY.current = e.touches[0].clientY;
    scrollStartPos.current = e.currentTarget.scrollTop || 0;
    scrolledDistance.current = 0;
  }, []);

  const onTouchMove = useCallback((e) => {
    if (e.currentTarget) {
      const currentScroll = e.currentTarget.scrollTop || 0;
      scrolledDistance.current = Math.abs(currentScroll - scrollStartPos.current);
    }
  }, []);

  const onTouchEnd = useCallback((e) => {
    const touchEndY = e.changedTouches[0].clientY;
    const verticalDist = Math.abs(touchEndY - touchStartY.current);
    
    // Only trigger tap if minimal scroll and movement
    if (scrolledDistance.current < threshold && verticalDist < threshold) {
      tapHandler?.();
    }
  }, [tapHandler, threshold]);

  return { onTouchStart, onTouchMove, onTouchEnd };
}