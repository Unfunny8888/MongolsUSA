import { useRef, useCallback } from 'react';

/**
 * Preserves scroll position during background data updates.
 * Prevents DOM reconstruction and layout thrashing.
 * 
 * Usage:
 *   const { lockScroll, unlockScroll } = useScrollLocking(containerRef);
 *   
 *   const handleDataUpdate = async () => {
 *     lockScroll();
 *     await fetchNewData();
 *     // DOM updates happen
 *     unlockScroll(); // Restores scroll position
 *   };
 */
export function useScrollLocking(containerRef) {
  const scrollStateRef = useRef({ top: 0, left: 0, isLocked: false });

  const lockScroll = useCallback(() => {
    if (!containerRef?.current) return;

    const container = containerRef.current;
    
    // Store current scroll position
    scrollStateRef.current = {
      top: container.scrollTop,
      left: container.scrollLeft,
      isLocked: true,
    };

    // Prevent scroll during update
    container.style.overscrollBehavior = 'contain';
    container.style.willChange = 'scroll-position';
  }, [containerRef]);

  const unlockScroll = useCallback(() => {
    if (!containerRef?.current) return;

    const container = containerRef.current;
    const { top, left } = scrollStateRef.current;

    // Restore scroll position within same frame
    requestAnimationFrame(() => {
      container.scrollTop = top;
      container.scrollLeft = left;

      // Reset styles
      container.style.overscrollBehavior = '';
      container.style.willChange = '';

      scrollStateRef.current.isLocked = false;
    });
  }, [containerRef]);

  return { lockScroll, unlockScroll };
}

/**
 * Batches DOM updates to prevent layout thrashing.
 * Wraps async data fetches with scroll preservation.
 */
export function useBatchedUpdate(containerRef) {
  const { lockScroll, unlockScroll } = useScrollLocking(containerRef);
  const pendingRef = useRef(false);

  const batchUpdate = useCallback(async (fetchFn) => {
    // Prevent concurrent updates
    if (pendingRef.current) return;
    pendingRef.current = true;

    lockScroll();

    try {
      // Fetch data
      const result = await fetchFn();

      // Let React batch state updates in same tick
      requestAnimationFrame(() => {
        // Updates happen here
      });

      // Restore scroll after updates are painted
      requestAnimationFrame(() => {
        unlockScroll();
      });

      return result;
    } finally {
      pendingRef.current = false;
    }
  }, [lockScroll, unlockScroll]);

  return batchUpdate;
}