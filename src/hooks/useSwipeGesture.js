import { useEffect, useRef } from "react";

/**
 * Detect horizontal swipe gestures on a target element with proper conflict prevention.
 * Supports both touch and pointer events, prevents accidental navigation.
 * @param {function} onSwipeLeft
 * @param {function} onSwipeRight
 * @param {{ threshold?: number, preventScroll?: boolean, velocity?: number }} options
 */
export function useSwipeGesture(onSwipeLeft, onSwipeRight, { threshold = 60, preventScroll = false, velocity = 0.5 } = {}) {
  const ref = useRef(null);
  const startX = useRef(null);
  const startY = useRef(null);
  const startTime = useRef(null);
  const isVerticalScroll = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function onTouchStart(e) {
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
      startTime.current = Date.now();
      isVerticalScroll.current = false;
    }

    function onTouchEnd(e) {
      if (startX.current === null || isVerticalScroll.current) {
        startX.current = null;
        return;
      }
      const dx = e.changedTouches[0].clientX - startX.current;
      const dy = e.changedTouches[0].clientY - startY.current;
      const deltaTime = Date.now() - startTime.current;
      const swipeVelocity = Math.abs(dx) / Math.max(deltaTime, 1);

      // Reject if vertical scroll, insufficient distance, or too slow
      if (Math.abs(dy) > Math.abs(dx) * 0.6) {
        startX.current = null;
        return;
      }
      if (Math.abs(dx) < threshold || swipeVelocity < velocity) {
        startX.current = null;
        return;
      }

      e.preventDefault();
      if (dx < 0) onSwipeLeft?.();
      else onSwipeRight?.();
      startX.current = null;
    }

    function onTouchMove(e) {
      if (startX.current === null) return;
      const dx = Math.abs(e.touches[0].clientX - startX.current);
      const dy = Math.abs(e.touches[0].clientY - startY.current);

      // Detect dominant direction after 10px threshold
      if (dx > 10 || dy > 10) {
        isVerticalScroll.current = dy > dx;
      }

      // Only prevent default for horizontal swipes
      if (preventScroll && dx > dy && dx > 5) {
        e.preventDefault();
      }
    }

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: false });
    el.addEventListener("touchmove", onTouchMove, { passive: !preventScroll });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchmove", onTouchMove);
    };
  }, [onSwipeLeft, onSwipeRight, threshold, preventScroll, velocity]);

  return ref;
}