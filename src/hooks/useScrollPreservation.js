import { useEffect, useRef, useCallback } from "react";

/**
 * Preserves and restores scroll position across state updates and re-renders.
 * Prevents automatic scroll resets during:
 * - Feed refresh
 * - Loading new content
 * - State updates
 * - Re-renders
 * 
 * @param {React.RefObject} containerRef - Ref to scrollable container
 * @param {string} storageKey - LocalStorage key for persistence (optional)
 */
export function useScrollPreservation(containerRef, storageKey = null) {
  const scrollPositionRef = useRef(0);
  const isUserScrollingRef = useRef(false);

  // Track scroll position
  const handleScroll = useCallback((e) => {
    if (isUserScrollingRef.current) {
      scrollPositionRef.current = e.target.scrollTop || window.scrollY;
      if (storageKey) {
        sessionStorage.setItem(storageKey, scrollPositionRef.current.toString());
      }
    }
  }, [storageKey]);

  // Detect user scroll
  useEffect(() => {
    const container = containerRef?.current || window;
    const markScrollStart = () => { isUserScrollingRef.current = true; };
    const markScrollEnd = () => { isUserScrollingRef.current = false; };

    container.addEventListener("scroll", handleScroll, { passive: true });
    container.addEventListener("scrollstart", markScrollStart);
    container.addEventListener("scrollend", markScrollEnd);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      container.removeEventListener("scrollstart", markScrollStart);
      container.removeEventListener("scrollend", markScrollEnd);
    };
  }, [containerRef, handleScroll]);

  // Restore scroll position without animation
  const restoreScrollPosition = useCallback((offset = 0) => {
    const target = containerRef?.current || window;
    const savedPosition = storageKey ? parseInt(sessionStorage.getItem(storageKey) || "0") : scrollPositionRef.current;
    const finalPosition = Math.max(0, savedPosition + offset);

    requestAnimationFrame(() => {
      if (containerRef?.current) {
        containerRef.current.scrollTop = finalPosition;
      } else {
        window.scrollTo(0, finalPosition);
      }
    });
  }, [containerRef, storageKey]);

  // Get current position without persisting
  const getCurrentPosition = useCallback(() => {
    if (containerRef?.current) {
      return containerRef.current.scrollTop;
    }
    return window.scrollY;
  }, [containerRef]);

  // Manually set scroll without triggering persistence
  const setScrollPosition = useCallback((position) => {
    scrollPositionRef.current = position;
    requestAnimationFrame(() => {
      if (containerRef?.current) {
        containerRef.current.scrollTop = position;
      } else {
        window.scrollTo(0, position);
      }
    });
  }, [containerRef]);

  return {
    restoreScrollPosition,
    getCurrentPosition,
    setScrollPosition,
    scrollPositionRef,
  };
}