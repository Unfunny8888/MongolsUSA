import { useRef, useCallback } from "react";

/**
 * Simple in-memory query cache for entity fetches.
 * Prevents redundant API calls for the same query within a session.
 */
export function useQueryCache(ttlMs = 60000) {
  const cache = useRef({});

  const get = useCallback((key) => {
    const entry = cache.current[key];
    if (!entry) return null;
    if (Date.now() - entry.ts > ttlMs) { delete cache.current[key]; return null; }
    return entry.data;
  }, [ttlMs]);

  const set = useCallback((key, data) => {
    cache.current[key] = { data, ts: Date.now() };
  }, []);

  const invalidate = useCallback((key) => { delete cache.current[key]; }, []);
  const clear = useCallback(() => { cache.current = {}; }, []);

  return { get, set, invalidate, clear };
}