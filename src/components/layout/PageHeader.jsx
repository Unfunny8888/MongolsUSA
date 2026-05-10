import { forwardRef, useCallback, useState, useEffect } from 'react';
import { ArrowLeft, Bell, MapPin, ChevronDown, Sparkles } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTabNavigation } from '@/hooks/useTabNavigation';
import { resolveRoute, TAB_ROOTS } from '@/lib/TabNavigationContext';
import { base44 } from '@/api/base44Client';
import { useDiscovery } from '@/lib/DiscoveryContext';
import CitySheet from '@/components/discovery/CitySheet';

const ROOT_LABELS = {
  '/jobs':        'Jobs',
  '/housing':     'Housing',
  '/services':    'Services',
  '/more':        'More',
  '/events':      'Events',
  '/vehicles':    'Vehicles',
  '/marketplace': 'Marketplace',
  '/rideshare':   'Ride Share',
};

// Root pages that get the city selector in the header
const CITY_SELECTOR_ROOTS = new Set(['/', '/jobs', '/housing', '/services', '/events', '/vehicles', '/marketplace', '/rideshare']);

const PageHeader = forwardRef(function PageHeader({ title, rightAction }, ref) {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, goBack } = useTabNavigation();
  const { city, setCity, recentCities } = useDiscovery();
  const [user, setUser] = useState(null);
  const [showCitySheet, setShowCitySheet] = useState(false);

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
  const showCitySelector = CITY_SELECTOR_ROOTS.has(location.pathname);
  const cityLabel = city ? city.split(',')[0] : 'All Cities';
  const isAllCities = !city;

  return (
    <>
      <div
        ref={ref}
        data-header
        className="fixed top-0 left-0 right-0 z-50 bg-card/97 backdrop-blur-2xl border-b border-border/15"
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
              {/* Left: brand or label */}
              <div className="flex-1 min-w-0">
                {isHome ? (
                  <div>
                    <h1 className="text-[20px] font-black tracking-tight leading-none">
                      <span className="text-primary">nomad</span>
                      <span className="text-foreground">link</span>
                    </h1>
                  </div>
                ) : (
                  <h1 className="text-[17px] font-bold text-foreground">{rootLabel || title}</h1>
                )}
              </div>

              {/* Center: city selector (on root pages that have it) */}
              {showCitySelector && (
                <button
                  onClick={() => setShowCitySheet(true)}
                  className="flex items-center gap-1.5 bg-secondary/60 hover:bg-secondary transition-colors rounded-full px-3 py-1.5 active:scale-[0.97] max-w-[140px]"
                >
                  <MapPin className={`w-3 h-3 shrink-0 ${isAllCities ? 'text-muted-foreground' : 'text-primary'}`} />
                  <span className={`text-[12px] font-bold truncate ${isAllCities ? 'text-muted-foreground' : 'text-foreground'}`}>
                    {cityLabel}
                  </span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
                </button>
              )}

              {/* Right: actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => navigate('/ai-assistant')}
                  className="w-8 h-8 rounded-full hover:bg-secondary/80 transition-colors flex items-center justify-center"
                  aria-label="AI Search"
                >
                  <Sparkles className="w-[18px] h-[18px] text-primary" />
                </button>
                <button
                  onClick={() => navigate('/notifications')}
                  className="w-8 h-8 rounded-full hover:bg-secondary/80 transition-colors flex items-center justify-center relative"
                  aria-label="Notifications"
                >
                  <Bell className="w-[18px] h-[18px] text-foreground/70" />
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full border border-card" />
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className="w-8 h-8 rounded-full overflow-hidden border-2 border-border/30 shrink-0"
                  aria-label="Profile"
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary/20 flex items-center justify-center text-[12px] font-bold text-primary">
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

      {showCitySheet && (
        <CitySheet
          currentCity={city}
          recentCities={recentCities}
          onSelect={(c) => { setCity(c); setShowCitySheet(false); }}
          onClose={() => setShowCitySheet(false)}
        />
      )}
    </>
  );
});

export default PageHeader;