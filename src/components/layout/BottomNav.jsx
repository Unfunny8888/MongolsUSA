import { useNavigate, useLocation } from "react-router-dom";
import { Home, Briefcase, Building2, Wrench, MoreHorizontal } from "lucide-react";
import { useTabNavigation } from "@/hooks/useTabNavigation";
import { useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { resolveRoute } from "@/lib/TabNavigationContext";

const TABS = [
  { id: 'home',     label: 'Home',     icon: Home,          root: '/'         },
  { id: 'jobs',     label: 'Jobs',     icon: Briefcase,     root: '/jobs'     },
  { id: 'housing',  label: 'Housing',  icon: Building2,     root: '/housing'  },
  { id: 'services', label: 'Services', icon: Wrench,        root: '/services' },
  { id: 'more',     label: 'More',     icon: MoreHorizontal,root: '/more'     },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, contextNavigate } = useTabNavigation();
  const tapTimestamps = useRef({});

  const currentTab = resolveRoute(location.pathname).tab;

  const handleTabPress = useCallback((tab) => {
    const now = Date.now();
    if (now - (tapTimestamps.current[tab.id] ?? 0) < 100) return;
    tapTimestamps.current[tab.id] = now;

    if (tab.id === currentTab) {
      const main = document.querySelector('[data-scrollable="true"]');
      if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
      if (location.pathname !== tab.root) navigate(tab.root, { replace: true });
    } else {
      navigate(tab.root);
    }
  }, [currentTab, location.pathname, navigate]);

  return (
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
  );
}