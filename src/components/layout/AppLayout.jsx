import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import BottomNav from "./BottomNav";
import MobileHeader from "./MobileHeader";
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

  return (
    <div className="app-container bg-background">
      <MobileHeader ref={headerRef} />
      <main ref={mainRef} className={`pb-24 max-w-lg mx-auto overflow-y-auto h-dvh ${location.pathname === '/search' ? '' : 'pt-[calc(4rem+1rem)]'}`} data-scrollable="true">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>
      <BottomNav />
    </div>
  );
}