import { useEffect, useRef } from "react";

/**
 * Detect horizontal swipe gestures on a target element.
 * @param {function} onSwipeLeft
 * @param {function} onSwipeRight
 * @param {{ threshold?: number, preventScroll?: boolean }} options
 */
export function useSwipeGesture(onSwipeLeft, onSwipeRight, { threshold = 60, preventScroll = false } = {}) {
  const ref = useRef(null);
  const startX = useRef(null);
  const startY = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function onTouchStart(e) {
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
    }

    function onTouchEnd(e) {
      if (startX.current === null) return;
      const dx = e.changedTouches[0].clientX - startX.current;
      const dy = e.changedTouches[0].clientY - startY.current;
      // Only horizontal swipes (not vertical scrolls)
      if (Math.abs(dx) < threshold || Math.abs(dy) > Math.abs(dx) * 0.8) return;
      if (dx < 0) onSwipeLeft?.();
      else onSwipeRight?.();
      startX.current = null;
    }

    function onTouchMove(e) {
      if (startX.current === null) return;
      if (preventScroll) {
        const dx = Math.abs(e.touches[0].clientX - startX.current);
        const dy = Math.abs(e.touches[0].clientY - startY.current);
        if (dx > dy) e.preventDefault();
      }
    }

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: !preventScroll });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchmove", onTouchMove);
    };
  }, [onSwipeLeft, onSwipeRight, threshold, preventScroll]);

  return ref;
}