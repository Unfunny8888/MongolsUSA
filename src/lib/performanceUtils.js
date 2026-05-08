/**
 * Performance monitoring and optimization utilities
 */

/**
 * Measure Core Web Vitals
 */
export function measureWebVitals(onMetric) {
  // Largest Contentful Paint (LCP)
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        onMetric({ name: 'LCP', value: lastEntry.renderTime || lastEntry.loadTime });
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // Silently fail if not supported
    }

    // First Input Delay (FID) / Interaction to Next Paint (INP)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const delay = entry.processingStart - entry.startTime;
          onMetric({ name: 'FID', value: delay });
        });
      });
      fidObserver.observe({ entryTypes: ['first-input', 'interaction'] });
    } catch (e) {
      // Silently fail if not supported
    }

    // Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            onMetric({ name: 'CLS', value: clsValue });
          }
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      // Silently fail if not supported
    }
  }

  // Navigation Timing
  window.addEventListener('load', () => {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    onMetric({ name: 'PageLoadTime', value: pageLoadTime });
  });
}

/**
 * Debounce function for scroll/resize handlers
 */
export function debounce(fn, delay = 150) {
  let timeoutId;
  return function debounced(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle function for high-frequency events
 */
export function throttle(fn, limit = 16) {
  let inThrottle;
  return function throttled(...args) {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Batch DOM reads/writes to prevent layout thrashing
 */
export const batchRead = [];
export const batchWrite = [];

export function scheduleRead(fn) {
  batchRead.push(fn);
  requestAnimationFrame(flushBatch);
}

export function scheduleWrite(fn) {
  batchWrite.push(fn);
  requestAnimationFrame(flushBatch);
}

function flushBatch() {
  batchRead.forEach((fn) => fn());
  batchWrite.forEach((fn) => fn());
  batchRead.length = 0;
  batchWrite.length = 0;
}