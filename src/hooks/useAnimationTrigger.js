import { useRef, useEffect, useCallback } from 'react';

/**
 * Throttles animation triggers during scroll to prevent layout jank.
 * Animations only play when scrolling pauses or item enters viewport.
 * 
 * Usage:
 *   const { shouldAnimate, ref } = useAnimationTrigger();
 *   return (
 *     <motion.div
 *       ref={ref}
 *       animate={shouldAnimate ? { opacity: 1 } : { opacity: 0 }}
 *     >
 *       Content
 *     </motion.div>
 *   );
 */
export function useAnimationTrigger() {
  const ref = useRef(null);
  const [shouldAnimate, setShouldAnimate] = useRef(false);
  const scrollTimeoutRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // IntersectionObserver to detect when element enters viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Enable animation when visible
          shouldAnimate.current = true;
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
    observerRef.current = observer;

    // Detect scroll and disable animations during scroll
    const handleScroll = () => {
      shouldAnimate.current = false;

      // Re-enable after scroll ends
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        shouldAnimate.current = true;
      }, 150); // Debounce time
    };

    // Use capture phase for earlier scroll detection
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll, { capture: true });
      clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  return { ref, shouldAnimate: shouldAnimate.current };
}

/**
 * Reduces animation during scroll within a specific container.
 * Useful for virtualized lists or modal scrollers.
 */
export function useScrollAwareAnimation(containerRef) {
  const isScrollingRef = useRef(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const container = containerRef?.current;
    if (!container) return;

    const handleScroll = () => {
      isScrollingRef.current = true;

      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 150);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutRef.current);
    };
  }, [containerRef]);

  return { isScrolling: isScrollingRef.current };
}