import { useRef, useCallback } from 'react';

const MOVE_THRESHOLD = 8; // px — beyond this = scroll, not tap
const POST_SCROLL_DELAY = 120; // ms — ignore taps right after scroll stops

/**
 * useTapGesture
 * Returns touch event handlers that fire onTap only when the user
 * intentionally taps (not when scrolling or just after scrolling).
 */
export function useTapGesture(onTap) {
  const startY = useRef(0);
  const startX = useRef(0);
  const startTime = useRef(0);
  const moved = useRef(false);
  const lastScrollEnd = useRef(0);

  const onTouchStart = useCallback((e) => {
    startY.current = e.touches[0].clientY;
    startX.current = e.touches[0].clientX;
    startTime.current = Date.now();
    moved.current = false;
  }, []);

  const onTouchMove = useCallback((e) => {
    const dy = Math.abs(e.touches[0].clientY - startY.current);
    const dx = Math.abs(e.touches[0].clientX - startX.current);
    if (dy > MOVE_THRESHOLD || dx > MOVE_THRESHOLD) {
      moved.current = true;
    }
  }, []);

  const onTouchEnd = useCallback((e) => {
    lastScrollEnd.current = Date.now();
    if (!moved.current) {
      // Intentional tap — fire after tiny delay to let scroll inertia settle
      const elapsed = Date.now() - startTime.current;
      if (elapsed < 500) {
        e.preventDefault();
        onTap(e);
      }
    }
  }, [onTap]);

  // Called from scroll events on the feed container to track inertia
  const onScrollEnd = useCallback(() => {
    lastScrollEnd.current = Date.now();
  }, []);

  return { onTouchStart, onTouchMove, onTouchEnd, onScrollEnd };
}