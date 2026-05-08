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
  return (
    <div
      ref={ref}
      className={`min-h-dvh bg-background pb-24 ${className}`}
      data-scrollable="true"
      style={{
        paddingTop: 'calc(3.5rem + env(safe-area-inset-top))',
        scrollBehavior: 'smooth',
      }}
    >
      {children}
    </div>
  );
});

export default ChildPageLayout;