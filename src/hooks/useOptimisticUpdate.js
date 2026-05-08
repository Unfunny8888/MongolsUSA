import { useState, useCallback } from 'react';

/**
 * useOptimisticUpdate - Instant UI feedback with server sync
 * Shows updated state immediately, reverts if server call fails
 */
export function useOptimisticUpdate(initialValue, asyncFn) {
  const [value, setValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggle = useCallback(async () => {
    const previousValue = value;
    const newValue = !value;

    // Optimistic update
    setValue(newValue);
    setIsLoading(true);
    setError(null);

    try {
      await asyncFn(newValue);
    } catch (err) {
      // Revert on error
      setValue(previousValue);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [value, asyncFn]);

  return { value, isLoading, error, toggle };
}