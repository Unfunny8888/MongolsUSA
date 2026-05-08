/**
 * Global gesture handler to prevent browser/page navigation conflicts.
 * Applies touch-action CSS rules and manages gesture prevention at app root.
 */

export function initializeGestureHandler() {
  const root = document.getElementById('root');
  if (!root) return;

  // Prevent Safari's default swipe-to-go-back gesture on carousel/swipe elements
  root.addEventListener('gesturestart', (e) => {
    e.preventDefault();
  }, { passive: false });

  // Handle back/forward swipe specifically on non-swipeable areas
  document.addEventListener('touchstart', (e) => {
    // Only prevent browser gestures if touch starts near edges
    const x = e.touches[0].clientX;
    const y = e.touches[0].clientY;
    const isNearEdge = x < 20 || x > window.innerWidth - 20;
    if (isNearEdge) {
      // Don't preventDefault here — let it be handled by specific components
    }
  }, { passive: true });
}

/**
 * CSS class to apply to carousels and swipeable containers.
 * Prevents browser gestures from interfering with app gestures.
 */
export const SWIPEABLE_CSS = `
  touch-action: pan-y pinch-zoom;
  overscroll-behavior-x: contain;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
`;

/**
 * CSS class for vertical scroll areas.
 * Allows natural scroll while preventing horizontal swipes.
 */
export const SCROLLABLE_CSS = `
  touch-action: pan-y;
  overscroll-behavior-x: contain;
  -webkit-user-select: text;
`;