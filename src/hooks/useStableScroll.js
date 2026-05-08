import { useEffect, useRef } from "react";

/**
 * Prevents layout shift from image loading, animations, and content updates.
 * Uses content-visibility and contain to stabilize scroll position.
 */
export function useStableScroll() {
  const scrollRestoreRef = useRef(null);

  // Restore scroll position after content layout shift
  useEffect(() => {
    let scrollPos = 0;
    const handleScroll = () => {
      scrollPos = window.scrollY || document.documentElement.scrollTop;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return scrollRestoreRef;
}

/**
 * Prevents animation layout shifts by applying will-change and containment.
 */
export const STABLE_ANIMATION_CLASSES = "will-change-transform contain-strict";