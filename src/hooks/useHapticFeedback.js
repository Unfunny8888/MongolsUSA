export function useHapticFeedback() {
  const trigger = (type = 'light') => {
    // Haptic feedback on mobile (iOS/Android)
    if (!navigator?.vibrate) return;

    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
      success: [10, 20, 10],
      error: [20, 10, 20],
      selection: [15],
    };

    navigator.vibrate?.(patterns[type] || patterns.light);
  };

  return { trigger };
}