import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

/**
 * Virtual scrolling for large lists.
 * Only renders visible items + buffer zone.
 * 
 * Usage:
 *   const { visibleItems, containerRef, sentinelRef } = useVirtualization(
 *     allItems,
 *     itemHeight,
 *     bufferSize
 *   );
 */
export function useVirtualization(items, itemHeight = 100, bufferSize = 5) {
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const containerRef = useRef(null);
  const sentinelRef = useRef(null);

  // Measure viewport on mount and resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      setViewportHeight(container.clientHeight);
    };

    measure();
    
    const resizeObs = new ResizeObserver(measure);
    resizeObs.observe(container);

    return () => resizeObs.disconnect();
  }, []);

  // Track scroll position with passive listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollTop(container.scrollTop);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate visible range
  const visibleItems = useMemo(() => {
    if (!viewportHeight) return [];

    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize);
    const endIndex = Math.min(
      items.length,
      Math.ceil((scrollTop + viewportHeight) / itemHeight) + bufferSize
    );

    return items.slice(startIndex, endIndex).map((item, i) => ({
      item,
      originalIndex: startIndex + i,
      offset: (startIndex + i) * itemHeight,
    }));
  }, [items, scrollTop, viewportHeight, itemHeight, bufferSize]);

  return {
    visibleItems,
    containerRef,
    sentinelRef,
    totalHeight: items.length * itemHeight,
  };
}