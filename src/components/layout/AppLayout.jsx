import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
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
  useEffect(() => { registerSW(); }, []);

  return (
    <div className="app-container bg-background">
      <MobileHeader />
      <main className="pb-24 max-w-lg mx-auto">
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