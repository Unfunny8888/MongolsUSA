import { forwardRef } from 'react';

/**
 * ChildPageLayout - Standardized wrapper for all child pages
 * 
 * Provides:
 * - Dynamic top padding that accounts for header + safe-area
 * - Safe bottom nav padding (pb-24)
 * - Proper scroll behavior
 * - Full safe-area support (iPhone notch, Android status bar)
 */
const ChildPageLayout = forwardRef(function ChildPageLayout({ children, className = '' }, ref) {
  // AppLayout already provides paddingTop (header) and paddingBottom (bottom nav)
  // ChildPageLayout is just a semantic wrapper — no extra padding.
  return (
    <div
      ref={ref}
      className={`bg-background ${className}`}
    >
      {children}
    </div>
  );
});

export default ChildPageLayout;