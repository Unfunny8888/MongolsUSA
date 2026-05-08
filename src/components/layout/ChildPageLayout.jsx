import { forwardRef } from 'react';

/**
 * ChildPageLayout - Standardized wrapper for all child pages
 * 
 * Provides:
 * - Consistent pt spacing (14 = 56px header / 14px = 1 unit per Tailwind)
 * - Safe bottom nav padding (pb-24)
 * - Proper scroll behavior
 * - Dark/light mode support
 */
const ChildPageLayout = forwardRef(function ChildPageLayout({ children, className = '' }, ref) {
  return (
    <div
      ref={ref}
      className={`min-h-dvh bg-background pt-14 pb-24 ${className}`}
      data-scrollable="true"
      style={{ scrollBehavior: 'smooth' }}
    >
      {children}
    </div>
  );
});

export default ChildPageLayout;