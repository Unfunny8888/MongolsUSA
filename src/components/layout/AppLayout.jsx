import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import BottomNav from "./BottomNav";
import PageHeader from "./PageHeader";
import { useNavigationStack } from "@/lib/useNavigationStack";
import PageTransition from "./PageTransition";




function registerSW() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    });
  }
}

export default function AppLayout() {
  const location = useLocation();
  const headerRef = useRef(null);
  const mainRef = useRef(null);
  const { pageInfo, isRoot, handleBack, scrollRef: navigationScrollRef } = useNavigationStack();

  // Connect AppLayout's main ref to navigation stack's scroll tracking
  useEffect(() => {
    if (navigationScrollRef.current !== mainRef.current) {
      navigationScrollRef.current = mainRef.current;
    }
  }, [navigationScrollRef]);

  useEffect(() => { registerSW(); }, []);

  useEffect(() => {
    const main = mainRef.current;
    const header = headerRef.current;
    if (!main || !header) return;

    let lastY = 0;
    let hidden = false;

    const onScroll = () => {
      const y = main.scrollTop;
      const diff = y - lastY;

      if (diff > 6 && y > 60 && !hidden) {
        header.style.transform = 'translateY(-110%)';
        hidden = true;
      } else if ((diff < -6 || y < 60) && hidden) {
        header.style.transform = 'translateY(0)';
        hidden = false;
      }
      lastY = y;
    };

    main.addEventListener('scroll', onScroll, { passive: true });
    return () => main.removeEventListener('scroll', onScroll);
  }, []);

  // Hide header on search page
  const hideHeader = location.pathname === '/search';

  return (
    <div className="app-container bg-background">
      {!hideHeader && (
        <PageHeader
          ref={headerRef}
          title={pageInfo?.label}
          onBack={handleBack}
          isRoot={isRoot}
        />
      )}
      <main ref={mainRef} className="max-w-lg mx-auto overflow-y-auto h-dvh pb-24" data-scrollable="true" style={hideHeader ? {} : { paddingTop: 'calc(3.5rem + env(safe-area-inset-top))' }}>
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
      </main>
      <BottomNav />
    </div>
  );
}