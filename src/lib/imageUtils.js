/**
 * Image optimization utilities
 * - CDN-optimized URLs via URL params (works with Unsplash + standard CDNs)
 * - Client-side compression before upload
 * - Responsive srcSet generation
 */

/**
 * Returns an optimized image URL.
 * For Unsplash: appends w/q params.
 * For others: returns as-is (CDN handles it if configured).
 */
export function optimizeImageUrl(url, { width = 800, quality = 80 } = {}) {
  if (!url) return "";
  try {
    if (url.includes("unsplash.com")) {
      const u = new URL(url);
      u.searchParams.set("w", width);
      u.searchParams.set("q", quality);
      u.searchParams.set("auto", "format");
      u.searchParams.set("fit", "crop");
      return u.toString();
    }
    return url;
  } catch {
    return url;
  }
}

/**
 * Generate srcSet for responsive images.
 */
export function srcSet(url, widths = [400, 800, 1200]) {
  if (!url || !url.includes("unsplash.com")) return undefined;
  return widths.map(w => `${optimizeImageUrl(url, { width: w })} ${w}w`).join(", ");
}

/**
 * Compress an image File client-side before upload.
 * Returns a Blob.
 */
export async function compressImage(file, { maxWidth = 1200, quality = 0.82 } = {}) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(blob => { URL.revokeObjectURL(url); resolve(blob || file); }, "image/webp", quality);
    };
    img.onerror = () => resolve(file);
    img.src = url;
  });
}