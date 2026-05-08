import { useEffect } from 'react';

/**
 * Prevents accidental page navigation via swipe/browser gestures
 * Allows controlled horizontal (carousels) and vertical (scroll) interactions
 */
export function useGestureHandler() {
  useEffect(() => {
    // Prevent browser back/forward swipe on iOS Safari and Android Chrome
    const preventSwipeNavigation = (e) => {
      // Allow overscroll only within scrollable containers (marked with data-scrollable)
      if (!e.target.closest('[data-scrollable]')) {
        e.preventDefault();
      }
    };

    // Prevent right-edge swipe (browser back gesture on iOS)
    const preventGesture = (e) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        // Block navigation if swipe is at screen edge (< 50px)
        if (touch.clientX < 50 && e.target.closest('[data-prevent-edge-swipe]')) {
          e.preventDefault();
        }
      }
    };

    // Disable overscroll bounce effect that triggers page navigation
    const preventOverscroll = (e) => {
      const el = e.target.closest('[data-scrollable]');
      if (!el) {
        e.preventDefault();
        return;
      }
      // Allow scroll only if within container bounds
      if (el.scrollTop === 0 && e.deltaY < 0) e.preventDefault();
      if (el.scrollTop + el.clientHeight >= el.scrollHeight && e.deltaY > 0) e.preventDefault();
    };

    // Apply handlers
    document.addEventListener('touchmove', preventGesture, { passive: false });
    document.addEventListener('wheel', preventOverscroll, { passive: false });

    // Disable browser default swipe-to-go-back
    if (window.history.pushState) {
      window.history.pushState(null, null, window.location.pathname);
    }

    return () => {
      document.removeEventListener('touchmove', preventGesture);
      document.removeEventListener('wheel', preventOverscroll);
    };
  }, []);
}

/**
 * Hook for controlled carousel/horizontal scrolling
 * Prevents vertical scroll interference
 */
export function useCarouselGesture(ref) {
  useEffect(() => {
    if (!ref?.current) return;

    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const diffX = Math.abs(currentX - startX);
      const diffY = Math.abs(currentY - startY);

      // If horizontal movement is dominant, prevent vertical scroll
      if (diffX > diffY && diffX > 10) {
        e.preventDefault();
      }
    };

    ref.current.addEventListener('touchstart', handleTouchStart, { passive: true });
    ref.current.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      ref.current?.removeEventListener('touchstart', handleTouchStart);
      ref.current?.removeEventListener('touchmove', handleTouchMove);
    };
  }, [ref]);
}