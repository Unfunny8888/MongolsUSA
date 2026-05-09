import { useNavigate, useLocation } from "react-router-dom";
import { Home, Compass, Users, Bell, User, Plus } from "lucide-react";
import { useTabNavigation } from "@/hooks/useTabNavigation";
import { useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { resolveRoute, TAB_ROOTS } from "@/lib/TabNavigationContext";

const TABS = [
  { id: 'home',          label: 'Home',         icon: Home,    root: '/'              },
  { id: 'marketplace',   label: 'Explore',      icon: Compass, root: '/explore'       },
  { id: 'community',     label: 'Community',    icon: Users,   root: '/groups'        },
  { id: 'notifications', label: 'Alerts',       icon: Bell,    root: '/notifications' },
  { id: 'profile',       label: 'Profile',      icon: User,    root: '/profile'       },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, contextNavigate } = useTabNavigation();
  const tapTimestamps = useRef({});

  // Active tab derived from URL — always accurate, no stale state
  const currentTab = resolveRoute(location.pathname).tab;

  const handleTabPress = useCallback((tab) => {
    // Debounce rapid taps (100ms) to prevent stack corruption
    const now = Date.now();
    if (now - (tapTimestamps.current[tab.id] ?? 0) < 100) return;
    tapTimestamps.current[tab.id] = now;

    if (tab.id === currentTab) {
      // Same tab: scroll to top
      const main = document.querySelector('[data-scrollable="true"]');
      if (main) main.scrollTo({ top: 0, behavior: 'smooth' });

      // If we're on a child page, also navigate back to root
      if (location.pathname !== tab.root) {
        navigate(tab.root, { replace: true });
      }
    } else {
      // Different tab: navigate to root, clearing child stack
      navigate(tab.root);
    }
  }, [currentTab, location.pathname, navigate]);

  const handleCreate = useCallback(() => {
    navigate('/create');
  }, [navigate]);

  return (
    <>
      {/* Floating create button — above bottom nav */}
      <motion.button
        onClick={handleCreate}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.92 }}
        className="fixed z-40 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center"
        style={{
          width: 52,
          height: 52,
          bottom: `calc(5.5rem + env(safe-area-inset-bottom))`,
          right: '1rem',
          willChange: 'transform',
        }}
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* Bottom navigation bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto bg-card/98 backdrop-blur-2xl border-t border-border/30"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.08), 0 -1px 0 rgba(0,0,0,0.05)',
          willChange: 'transform',
          transform: 'translateZ(0)',
        }}
      >
        <div className="flex items-stretch justify-around h-16">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === currentTab;

            return (
              <motion.button
                key={tab.id}
                onClick={() => handleTabPress(tab)}
                whileTap={{ scale: 0.88 }}
                className={`flex flex-col items-center justify-center flex-1 gap-0.5 relative min-h-[44px] transition-colors duration-150 ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {/* Active indicator pill behind icon */}
                {isActive && (
                  <motion.div
                    layoutId="tabActivePill"
                    className="absolute top-1.5 rounded-full bg-primary/10"
                    style={{ width: 40, height: 26 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  />
                )}
                <Icon className="w-5 h-5 relative z-10" strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[10px] font-medium relative z-10 ${isActive ? 'font-semibold' : ''}`}>
                  {tab.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </nav>
    </>
  );
}