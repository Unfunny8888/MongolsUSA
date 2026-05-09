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

  // Always show a fallback — never the browser broken-image icon
  if (error) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className={`relative overflow-hidden bg-secondary flex items-center justify-center ${className}`}>
        <svg className="w-8 h-8 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5" />
          <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="1.5" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 15l-5-5L5 21" />
        </svg>
      </div>
    );
  }

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