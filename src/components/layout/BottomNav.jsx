import { useNavigate, useLocation } from "react-router-dom";
import { Home, Compass, Users, Bell, User, Plus } from "lucide-react";
import { useTabNavigation } from "@/hooks/useTabNavigation";
import { useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";

const TABS = [
  { id: 'home', label: 'Home', icon: Home, root: '/' },
  { id: 'marketplace', label: 'Marketplace', icon: Compass, root: '/explore' },
  { id: 'community', label: 'Community', icon: Users, root: '/groups' },
  { id: 'notifications', label: 'Notifications', icon: Bell, root: '/notifications' },
  { id: 'profile', label: 'Profile', icon: User, root: '/profile' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, switchTab, getCurrentRoute, getTabRoot } = useTabNavigation();
  const navRef = useRef(null);

  // Determine current tab
  const getCurrentTab = useCallback(() => {
    const path = location.pathname;
    
    // Exact matches first
    for (const tab of TABS) {
      if (path === tab.root) return tab.id;
    }
    
    // Child page matches
    if (path.startsWith('/listing') || path.startsWith('/business') || path.startsWith('/explore')) return 'marketplace';
    if (path.startsWith('/group') || path.startsWith('/groups')) return 'community';
    if (path.startsWith('/conversation') || path.startsWith('/inbox')) return 'profile';
    if (path.startsWith('/notifications')) return 'notifications';
    if (path.startsWith('/edit-profile') || path.startsWith('/my-listings') || 
        path.startsWith('/saved') || path.startsWith('/ai-assistant') || 
        path.startsWith('/vip') || path.startsWith('/business-dashboard') || 
        path.startsWith('/recruiter') || path === '/profile') return 'profile';
    
    return 'home';
  }, [location.pathname]);

  const currentTab = getCurrentTab();

  // Handle tab switching
  const handleTabSwitch = useCallback((tab) => {
    if (tab.id === currentTab) {
      // Scroll to top if already on tab
      const main = document.querySelector('[data-scrollable="true"]');
      if (main) {
        main.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      // Switch to different tab
      switchTab(tab.id);
      navigate(tab.root);
    }
  }, [currentTab, navigate, switchTab]);

  // Handle create button
  const handleCreate = useCallback(() => {
    navigate('/create');
  }, [navigate]);

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        onClick={handleCreate}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-28 right-4 z-40 bg-primary text-primary-foreground rounded-full p-4 shadow-lg hover:shadow-xl transition-shadow"
        style={{
          marginBottom: 'env(safe-area-inset-bottom)',
          transform: 'translateZ(0)',
        }}
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* Bottom Navigation */}
      <nav
        ref={navRef}
        className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto bg-card/95 backdrop-blur-xl border-t border-border/40 shadow-2xl"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          transform: 'translateZ(0)',
        }}
      >
        <div className="flex items-center justify-around h-20">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === currentTab;

            return (
              <motion.button
                key={tab.id}
                onClick={() => handleTabSwitch(tab)}
                className={`flex flex-col items-center justify-center w-full h-full gap-1 relative transition-colors duration-200 ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
                whileTap={{ scale: 0.9 }}
              >
                <div className="relative">
                  <Icon className="w-6 h-6" />
                  {isActive && (
                    <motion.div
                      layoutId="bottomNavActive"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </div>
                <span className="text-[10px] font-medium truncate">{tab.label}</span>
              </motion.button>
            );
          })}
        </div>
      </nav>
    </>
  );
}