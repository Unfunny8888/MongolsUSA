import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Hook for infinite scroll pagination.
 * @param {Array} items - Full array of items to paginate
 * @param {number} pageSize - Items per page
 * @returns {{ visible, sentinelRef, hasMore, reset }}
 */
export function useInfiniteScroll(items, pageSize = 12) {
  const [page, setPage] = useState(1);
  const sentinelRef = useRef(null);

  const visible = items.slice(0, page * pageSize);
  const hasMore = visible.length < items.length;

  // Reset when items change (e.g. filter change)
  const reset = useCallback(() => setPage(1), []);
  useEffect(() => { setPage(1); }, [items.length]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) setPage(p => p + 1); },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, sentinelRef.current]);

  return { visible, sentinelRef, hasMore, reset };
}