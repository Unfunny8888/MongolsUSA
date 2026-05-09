import { forwardRef, useCallback } from 'react';
import { ArrowLeft, Bell, Search } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTabNavigation } from '@/hooks/useTabNavigation';
import { resolveRoute, TAB_ROOTS } from '@/lib/TabNavigationContext';

const PageHeader = forwardRef(function PageHeader({ title, rightAction }, ref) {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, goBack } = useTabNavigation();

  const resolved = resolveRoute(location.pathname);
  const isRoot = resolved.isRoot;
  const stack = state.stacks[state.activeTab] ?? [];

  const handleBack = useCallback(() => {
    // Always try context goBack first
    const target = goBack();
    if (target) {
      navigate(target.path);
    } else {
      // Fallback: navigate to current tab root (never loops)
      const tabRoot = TAB_ROOTS[state.activeTab];
      navigate(tabRoot ?? '/', { replace: true });
    }
  }, [goBack, navigate, state.activeTab]);

  return (
    <div
      ref={ref}
      data-header
      className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-2xl border-b border-border/20"
      style={{
        height: 'calc(3.5rem + env(safe-area-inset-top))',
        paddingTop: 'env(safe-area-inset-top)',
        boxShadow: '0 1px 0 rgba(0,0,0,0.04), 0 2px 12px rgba(0,0,0,0.04)',
        willChange: 'transform',
        transform: 'translateZ(0) translateY(0)',
        transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
      }}
    >
      <div className="px-3 max-w-lg mx-auto h-14 flex items-center justify-between gap-2">
        {isRoot ? (
          <>
            {/* Root header: Branding + quick actions */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-black tracking-tight leading-none">
                <span className="text-primary">nomad</span>
                <span className="text-foreground">link</span>
              </h1>
              <p className="text-[10px] text-muted-foreground font-semibold tracking-widest mt-0.5 uppercase">
                Marketplace
              </p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => navigate('/search')}
                className="w-10 h-10 rounded-full bg-secondary/60 hover:bg-secondary transition-colors flex items-center justify-center active:scale-95"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/notifications')}
                className="w-10 h-10 rounded-full bg-secondary/60 hover:bg-secondary transition-colors flex items-center justify-center active:scale-95 relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-card" />
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Child header: Back + Title + optional action */}
            <button
              onClick={handleBack}
              className="w-10 h-10 rounded-full bg-secondary/50 hover:bg-secondary transition-colors flex items-center justify-center active:scale-90 flex-shrink-0"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="flex-1 text-center text-[15px] font-semibold text-foreground truncate px-2">
              {title}
            </h2>
            {rightAction ?? <div className="w-10 flex-shrink-0" />}
          </>
        )}
      </div>
    </div>
  );
});

export default PageHeader;