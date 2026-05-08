import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import BottomNav from "./BottomNav";
import PageHeader from "./PageHeader";
import PageTransition from "./PageTransition";
import { useTabNavigation } from "@/hooks/useTabNavigation";

const TAB_ROUTES = {
  '/': 'home',
  '/explore': 'marketplace',
  '/groups': 'community',
  '/notifications': 'notifications',
  '/profile': 'profile',
};

function registerSW() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    });
  }
}

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const headerRef = useRef(null);
  const mainRef = useRef(null);
  const { state, getCurrentRoute, switchTab, saveScrollPosition, getScrollPosition } = useTabNavigation();

  // Determine which tab the current path belongs to
  const getTabFromPath = (pathname) => {
    for (const [path, tab] of Object.entries(TAB_ROUTES)) {
      if (pathname.startsWith(path) && pathname === path) {
        return tab;
      }
    }
    // Check root pages by direct match
    if (TAB_ROUTES[pathname]) return TAB_ROUTES[pathname];
    
    // For child pages, determine parent tab
    if (pathname.startsWith('/listing') || pathname.startsWith('/business')) return 'marketplace';
    if (pathname.startsWith('/group')) return 'community';
    if (pathname.startsWith('/conversation') || pathname.startsWith('/inbox')) return 'profile';
    if (pathname.startsWith('/edit-profile') || pathname.startsWith('/my-listings') || 
        pathname.startsWith('/saved') || pathname.startsWith('/saved-searches') ||
        pathname.startsWith('/ai-assistant') || pathname.startsWith('/vip') ||
        pathname.startsWith('/business-dashboard') || pathname.startsWith('/recruiter')) return 'profile';
    
    return 'home';
  };

  // Sync route changes to tab navigation
  useEffect(() => {
    const currentTab = getTabFromPath(location.pathname);
    
    if (currentTab !== state.activeTab) {
      switchTab(currentTab);
    }
  }, [location.pathname, state.activeTab, switchTab, getTabFromPath]);

  // Restore scroll position when route changes
  useEffect(() => {
    const scrollPos = getScrollPosition();
    if (mainRef.current && scrollPos > 0) {
      mainRef.current.scrollTop = scrollPos;
    }
  }, [location.pathname, getScrollPosition]);

  // Save scroll position before leaving
  useEffect(() => {
    return () => {
      if (mainRef.current) {
        saveScrollPosition(mainRef.current.scrollTop);
      }
    };
  }, [location.pathname, saveScrollPosition]);

  // Header hide/show on scroll
  useEffect(() => {
    const main = mainRef.current;
    const header = headerRef.current;
    if (!main || !header) return;

    let lastY = 0;
    let isHidden = false;
    let scrollTimeout;

    const onScroll = () => {
      clearTimeout(scrollTimeout);
      const y = main.scrollTop;
      const diff = y - lastY;

      if (diff < -8 && isHidden) {
        header.style.transform = 'translateY(0)';
        isHidden = false;
      } else if (diff > 8 && y > 80 && !isHidden) {
        scrollTimeout = setTimeout(() => {
          if (main.scrollTop > 80) {
            header.style.transform = 'translateY(-100%)';
            isHidden = true;
          }
        }, 200);
      }
      lastY = y;
    };

    main.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      main.removeEventListener('scroll', onScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  useEffect(() => { registerSW(); }, []);

  const currentRoute = getCurrentRoute();
  const hideHeader = location.pathname === '/search' || location.pathname === '/auth' || location.pathname === '/onboarding';

  return (
    <div className="app-container bg-background min-h-dvh flex flex-col">
      {!hideHeader && (
        <PageHeader
          ref={headerRef}
          title={currentRoute?.label}
        />
      )}
      <main 
        ref={mainRef} 
        className="flex-1 overflow-y-auto max-w-lg mx-auto w-full pb-24"
        data-scrollable="true"
        style={hideHeader ? {} : { paddingTop: 'calc(3.5rem + env(safe-area-inset-top))' }}
      >
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
      </main>
      <BottomNav />
    </div>
  );
}