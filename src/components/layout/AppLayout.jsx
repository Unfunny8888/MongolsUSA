import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import BottomNav from "./BottomNav";
import PageHeader from "./PageHeader";
import { useNavigationStack } from "@/lib/useNavigationStack";
import PageTransition from "./PageTransition";
import { motion } from "framer-motion";




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

  // Smooth header hide/show on scroll with better performance
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

      // Show header immediately on scroll up
      if (diff < -8 && isHidden) {
        header.style.transform = 'translateY(0)';
        isHidden = false;
      }
      // Hide header after scrolling down
      else if (diff > 8 && y > 80 && !isHidden) {
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