import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useLayoutEffect } from "react";
import BottomNav from "./BottomNav";
import PageHeader from "./PageHeader";
import PageTransition from "./PageTransition";
import { useTabNavigation } from "@/hooks/useTabNavigation";

const NO_HEADER_PATHS = new Set(['/auth', '/onboarding', '/search']);

export default function AppLayout() {
  const location = useLocation();
  const headerRef = useRef(null);
  const mainRef = useRef(null);
  const { contextNavigate, getCurrentRoute, saveScrollPosition, getScrollPosition, state } = useTabNavigation();

  // Sync every URL change into tab navigation state — single source of truth
  useEffect(() => {
    contextNavigate(location.pathname);
  }, [location.pathname, contextNavigate]);

  // Scroll to top on child-page push; restore root scroll on tab root
  const prevPathRef = useRef(location.pathname);
  useLayoutEffect(() => {
    const prevPath = prevPathRef.current;
    const nextPath = location.pathname;
    prevPathRef.current = nextPath;

    if (!mainRef.current) return;

    // Going to a tab root → restore that tab's saved scroll
    const isRoot = ['/', '/explore', '/groups', '/notifications', '/profile'].includes(nextPath);
    if (isRoot) {
      const saved = getScrollPosition(state.activeTab);
      mainRef.current.scrollTop = saved;
    } else {
      // Child page → start from top
      mainRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  // Save tab-root scroll position on every scroll event
  const saveScrollRef = useRef(null);
  useEffect(() => {
    saveScrollRef.current = saveScrollPosition;
  }, [saveScrollPosition]);

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;
    const onScroll = () => {
      saveScrollRef.current?.(main.scrollTop);
    };
    main.addEventListener('scroll', onScroll, { passive: true });
    return () => main.removeEventListener('scroll', onScroll);
  }, []);

  // Header auto-hide on scroll — reset state on each route change
  useEffect(() => {
    const main = mainRef.current;
    const header = headerRef.current;
    if (!main || !header) return;

    // Always show header fresh on route change
    header.style.transform = 'translateZ(0) translateY(0)';

    let lastY = main.scrollTop;
    let ticking = false;
    let isHidden = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = main.scrollTop;
        const diff = y - lastY;

        if (diff < -6 && isHidden) {
          header.style.transform = 'translateZ(0) translateY(0)';
          isHidden = false;
        } else if (diff > 6 && y > 80 && !isHidden) {
          header.style.transform = 'translateZ(0) translateY(-110%)';
          isHidden = true;
        }
        lastY = y;
        ticking = false;
      });
    };

    main.addEventListener('scroll', onScroll, { passive: true });
    return () => main.removeEventListener('scroll', onScroll);
  }, [location.pathname]);

  const hideHeader = NO_HEADER_PATHS.has(location.pathname);
  const currentRoute = getCurrentRoute();

  return (
    <div
      className="flex flex-col bg-background"
      style={{ height: '100dvh', overflow: 'hidden' }}
    >
      {!hideHeader && (
        <PageHeader ref={headerRef} title={currentRoute?.label} />
      )}

      {/* Scrollable content area */}
      <main
        ref={mainRef}
        className="flex-1 overflow-y-auto overflow-x-hidden max-w-lg mx-auto w-full"
        data-scrollable="true"
        style={{
          // Account for fixed header + bottom nav
          paddingTop: hideHeader ? 0 : 'calc(3.5rem + env(safe-area-inset-top))',
          paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))',
          WebkitOverflowScrolling: 'touch',
          overscrollBehaviorY: 'contain',
        }}
      >
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>

      <BottomNav />
    </div>
  );
}