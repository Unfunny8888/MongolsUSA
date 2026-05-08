import { useEffect } from 'react';

/**
 * Handle Safari iOS viewport instability:
 * - Address bar collapse/expand
 * - Keyboard appearance/disappearance
 * - Dynamic height recalculation
 */
export function useSafariViewport() {
  useEffect(() => {
    // Only run on Safari iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (!isIOS) return;

    // Store initial viewport height
    let initialInnerHeight = window.innerHeight;
    let isKeyboardOpen = false;

    const updateViewportHeight = () => {
      const currentHeight = window.innerHeight;
      const heightDiff = Math.abs(initialInnerHeight - currentHeight);

      // Detect keyboard appearance (height reduction > 150px)
      if (heightDiff > 150) {
        isKeyboardOpen = currentHeight < initialInnerHeight;
      }

      // Update CSS variable for dynamic height
      document.documentElement.style.setProperty('--vh', `${currentHeight * 0.01}px`);
      document.documentElement.style.setProperty('--dvh-safe', `${currentHeight}px`);

      // Prevent scroll jank by disabling momentum scrolling during keyboard transition
      if (isKeyboardOpen) {
        document.body.style.webkitOverflowScrolling = 'auto';
      } else {
        document.body.style.webkitOverflowScrolling = 'touch';
      }
    };

    const handleResize = () => {
      // Debounce resize events to prevent excessive recalculations
      clearTimeout(handleResize.timeout);
      handleResize.timeout = setTimeout(updateViewportHeight, 150);
    };

    const handleOrientationChange = () => {
      initialInnerHeight = window.innerHeight;
      updateViewportHeight();
    };

    // Listen for viewport changes
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleOrientationChange, { passive: true });

    // Handle focus/blur on inputs (keyboard open/close)
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach((input) => {
      input.addEventListener('focus', () => {
        isKeyboardOpen = true;
        // Delay scroll adjustment slightly to account for keyboard animation
        setTimeout(updateViewportHeight, 100);
      }, { passive: true });

      input.addEventListener('blur', () => {
        isKeyboardOpen = false;
        // Give keyboard time to close before recalculating
        setTimeout(() => {
          initialInnerHeight = window.innerHeight;
          updateViewportHeight();
        }, 300);
      }, { passive: true });
    });

    // Initial setup
    updateViewportHeight();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      clearTimeout(handleResize.timeout);
      inputs.forEach((input) => {
        input.removeEventListener('focus', updateViewportHeight);
        input.removeEventListener('blur', updateViewportHeight);
      });
    };
  }, []);
}