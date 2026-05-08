import { forwardRef } from 'react';

/**
 * ChildPageLayout - Standardized wrapper for all child pages
 * 
 * Ensures:
 * - Consistent spacing
 * - Proper header offset (pt-14 for header)
 * - Safe area handling
 * - Proper scroll behavior
 * - Bottom nav padding
 */
const ChildPageLayout = forwardRef(function ChildPageLayout({ children, className = '' }, ref) {
  return (
    <div
      ref={ref}
      className={`min-h-dvh bg-background pt-14 pb-24 ${className}`}
      data-scrollable="true"
    >
      {children}
    </div>
  );
});

export default ChildPageLayout;