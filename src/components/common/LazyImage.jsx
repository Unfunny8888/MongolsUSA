import { useState, useRef, useEffect } from "react";
import { optimizeImageUrl, srcSet } from "../../lib/imageUtils";

/**
 * Lazy-loaded, CDN-optimized image with blur-up effect.
 * Uses IntersectionObserver to defer loading off-screen images.
 */
export default function LazyImage({ src, alt = "", className = "", width = 800, quality = 80, fallback = null }) {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const [error, setError] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const optimized = optimizeImageUrl(src, { width, quality });
  const ss = srcSet(src);

  if (error && fallback) return <>{fallback}</>;

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      {/* Blur placeholder */}
      {!loaded && (
        <div className="absolute inset-0 bg-secondary animate-pulse" />
      )}
      {inView && src && (
        <img
          src={optimized}
          srcSet={ss}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px"
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
}