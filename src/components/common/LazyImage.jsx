import { useState, useRef, useEffect, memo } from 'react';

/**
 * Optimized lazy image with blur-up effect
 * - Defers loading until near viewport
 * - Shows placeholder while loading
 * - No layout shift
 */
function LazyImage({ 
  src, 
  alt, 
  className = '',
  aspectRatio = '16/10',
  blurDataURL = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 10"%3E%3Crect fill="%23f0f0f0" width="16" height="10"/%3E%3C/svg%3E'
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !src) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && imgRef.current) {
          // Start loading
          imgRef.current.src = src;
          imgRef.current.onload = () => setLoaded(true);
          imgRef.current.onerror = () => setError(true);
          observer.unobserve(containerRef.current);
        }
      },
      { rootMargin: '50px' }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [src]);

  return (
    <div
      ref={containerRef}
      className={`${className} relative overflow-hidden bg-secondary/50`}
      style={{
        aspectRatio,
        contain: 'layout style paint',
      }}
    >
      {/* Blur placeholder */}
      <img
        src={blurDataURL}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover blur-sm"
        aria-hidden="true"
        style={{ contentVisibility: 'auto' }}
      />

      {/* Main image */}
      <img
        ref={imgRef}
        alt={alt}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        } ${error ? 'hidden' : ''}`}
        loading="lazy"
        decoding="async"
        style={{
          contentVisibility: 'auto',
          willChange: loaded ? 'auto' : 'opacity',
        }}
      />

      {/* Fallback for failed image */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-secondary/70">
          <span className="text-2xl">📷</span>
        </div>
      )}
    </div>
  );
}

export default memo(LazyImage);