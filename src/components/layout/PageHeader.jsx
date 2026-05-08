import { forwardRef } from 'react';
import { ArrowLeft, Bell, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * PageHeader - Unified header component for all pages
 * 
 * 56px fixed height on all pages
 * 14px top padding (included in height)
 * 12px horizontal padding
 * Centered title with back button left, actions right
 * Native mobile app appearance
 * 
 * Props:
 * - title: string (auto-hidden for root pages)
 * - onBack: function (custom back behavior, defaults to navigate(-1))
 * - rightAction: React element (optional right action)
 * - isRoot: boolean (shows branding instead of back button)
 */
const PageHeader = forwardRef(function PageHeader(
  { title, onBack, rightAction, isRoot = false },
  ref
) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div
      ref={ref}
      data-header
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/90 border-b border-border/20 shadow-sm"
      style={{
        height: 'calc(3.5rem + env(safe-area-inset-top))',
        paddingTop: 'env(safe-area-inset-top)',
        transform: 'translateZ(0)',
        willChange: 'transform',
      }}
    >
      <div className="px-3 max-w-lg mx-auto h-14 flex items-center justify-between">
        {isRoot ? (
          // Root: Logo + Action buttons (width-constrained)
          <>
            <div className="flex-1">
              <h1 className="text-2xl font-black tracking-tight leading-none">
                <span className="text-primary">nomad</span>
                <span className="text-foreground">link</span>
              </h1>
              <p className="text-[10px] text-muted-foreground font-medium tracking-wide mt-0.5">MARKETPLACE</p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => navigate('/search')}
                className="w-10 h-10 rounded-full bg-secondary/60 hover:bg-secondary/80 transition-all flex items-center justify-center active:scale-95 min-h-[44px] min-w-[44px]"
                title="Search"
              >
                <Search className="w-5 h-5 text-foreground" />
              </button>
              <button
                onClick={() => navigate('/notifications')}
                className="w-10 h-10 rounded-full bg-secondary/60 hover:bg-secondary/80 transition-all flex items-center justify-center active:scale-95 relative min-h-[44px] min-w-[44px]"
                title="Notifications"
              >
                <Bell className="w-5 h-5 text-foreground" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
              </button>
            </div>
          </>
        ) : (
          // Child: Back button - Title (centered) - Action button
          <>
            <button
              onClick={handleBack}
              className="w-10 h-10 rounded-full bg-secondary/40 hover:bg-secondary/60 transition-all flex items-center justify-center active:scale-95 flex-shrink-0 min-h-[44px] min-w-[44px]"
              title="Back"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex-1 min-w-0 text-center px-3">
              <h2 className="text-base font-semibold text-foreground truncate">{title}</h2>
            </div>
            {rightAction ? rightAction : <div className="w-10 flex-shrink-0" />}
          </>
        )}
      </div>
    </div>
  );
});

export default PageHeader;