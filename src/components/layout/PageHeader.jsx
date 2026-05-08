import { forwardRef } from 'react';
import { ArrowLeft, Bell, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * PageHeader - Unified header component for all pages
 * 
 * Props:
 * - title: string (centered, auto-hidden for root pages)
 * - onBack: function (custom back behavior)
 * - rightAction: React element (optional right action button)
 * - isRoot: boolean (shows branding instead of back button)
 */
const PageHeader = forwardRef(function PageHeader(
  { title, onBack, rightAction, isRoot = false, hideOnScroll = true },
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
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/90 border-b border-border/20 shadow-sm transition-all duration-300"
      style={{
        transform: 'translateZ(0)',
        willChange: 'transform',
      }}
    >
      <div
        className="px-4 max-w-lg mx-auto"
        style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
      >
        {isRoot ? (
          // Root: Logo + Action buttons
          <div className="flex items-center justify-between h-16">
            <div className="flex-1">
              <h1 className="text-2xl font-black tracking-tight">
                <span className="text-primary">nomad</span>
                <span className="text-foreground">link</span>
              </h1>
              <p className="text-[10px] text-muted-foreground font-medium tracking-wide mt-0.5">
                MARKETPLACE
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/search')}
                className="w-10 h-10 rounded-full bg-secondary/60 hover:bg-secondary/80 transition-all duration-200 flex items-center justify-center active:scale-95 min-h-[44px] min-w-[44px]"
                title="Search"
              >
                <Search className="w-5 h-5 text-foreground" />
              </button>
              <button
                onClick={() => navigate('/notifications')}
                className="w-10 h-10 rounded-full bg-secondary/60 hover:bg-secondary/80 transition-all duration-200 flex items-center justify-center active:scale-95 relative min-h-[44px] min-w-[44px]"
                title="Notifications"
              >
                <Bell className="w-5 h-5 text-foreground" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
              </button>
            </div>
          </div>
        ) : (
          // Child: Back button + Title + Action button (centered layout)
          <div className="flex items-center h-14 gap-3">
            {/* Back button - LEFT */}
            <button
              onClick={handleBack}
              className="w-10 h-10 rounded-full bg-secondary/40 hover:bg-secondary/60 transition-all duration-200 flex items-center justify-center active:scale-95 flex-shrink-0 min-h-[44px] min-w-[44px]"
              title="Back"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>

            {/* Title - CENTER (flex-1 to push action to right) */}
            <div className="flex-1 min-w-0 text-center">
              <h2 className="text-base font-semibold text-foreground truncate">
                {title}
              </h2>
            </div>

            {/* Action button - RIGHT (optional) */}
            {rightAction ? (
              rightAction
            ) : (
              <div className="w-10 flex-shrink-0" />
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export default PageHeader;