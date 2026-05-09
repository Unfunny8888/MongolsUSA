import { forwardRef, useCallback, useState, useEffect } from 'react';
import { ArrowLeft, Bell, Search } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTabNavigation } from '@/hooks/useTabNavigation';
import { resolveRoute, TAB_ROOTS } from '@/lib/TabNavigationContext';
import { base44 } from '@/api/base44Client';

// Root labels for non-home tab roots
const ROOT_LABELS = {
  '/jobs':      'Jobs',
  '/housing':   'Housing',
  '/services':  'Services',
  '/more':      'More',
  '/events':    'Events',
  '/vehicles':  'Vehicles',
  '/marketplace': 'Marketplace',
  '/rideshare': 'Ride Share',
};

const PageHeader = forwardRef(function PageHeader({ title, rightAction }, ref) {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, goBack } = useTabNavigation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.isAuthenticated().then(authed => {
      if (authed) base44.auth.me().then(me => setUser(me)).catch(() => {});
    });
  }, []);

  const resolved = resolveRoute(location.pathname);
  const isRoot = resolved.isRoot;

  const handleBack = useCallback(() => {
    const target = goBack();
    if (target) {
      navigate(target.path);
    } else {
      const tabRoot = TAB_ROOTS[state.activeTab];
      navigate(tabRoot ?? '/', { replace: true });
    }
  }, [goBack, navigate, state.activeTab]);

  const rootLabel = ROOT_LABELS[location.pathname];
  const isHome = location.pathname === '/';

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
      <div className="px-4 max-w-lg mx-auto h-14 flex items-center justify-between gap-2">
        {isRoot ? (
          <>
            {/* Root header */}
            <div className="flex-1 min-w-0">
              {isHome ? (
                <>
                  <h1 className="text-[22px] font-black tracking-tight leading-none">
                    <span className="text-primary">nomad</span>
                    <span className="text-foreground">link</span>
                  </h1>
                  <p className="text-[9px] text-muted-foreground font-bold tracking-widest uppercase">
                    Marketplace
                  </p>
                </>
              ) : rootLabel ? (
                <h1 className="text-[18px] font-bold text-foreground">
                  {rootLabel}
                </h1>
              ) : (
                <h1 className="text-[18px] font-bold text-foreground">{title}</h1>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => navigate('/search')}
                className="w-9 h-9 rounded-full hover:bg-secondary/80 transition-colors flex items-center justify-center"
                aria-label="Search"
              >
                <Search className="w-5 h-5 text-foreground/70" />
              </button>
              <button
                onClick={() => navigate('/notifications')}
                className="w-9 h-9 rounded-full hover:bg-secondary/80 transition-colors flex items-center justify-center relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 text-foreground/70" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-card" />
              </button>
              {/* Profile avatar */}
              <button
                onClick={() => navigate('/profile')}
                className="w-9 h-9 rounded-full overflow-hidden border-2 border-border/30 shrink-0"
                aria-label="Profile"
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.full_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary/20 flex items-center justify-center text-[13px] font-bold text-primary">
                    {user?.full_name?.[0] || '?'}
                  </div>
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Child header */}
            <button
              onClick={handleBack}
              className="w-9 h-9 rounded-full bg-secondary/50 hover:bg-secondary transition-colors flex items-center justify-center active:scale-90 flex-shrink-0"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="flex-1 text-center text-[15px] font-semibold text-foreground truncate px-2">
              {title}
            </h2>
            {rightAction ?? <div className="w-9 flex-shrink-0" />}
          </>
        )}
      </div>
    </div>
  );
});

export default PageHeader;