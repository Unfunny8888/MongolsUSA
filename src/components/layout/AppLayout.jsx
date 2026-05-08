import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useCallback } from "react";
import { useSwipeGesture } from "../../hooks/useSwipeGesture";
import BottomNav from "./BottomNav";


const NAV_ORDER = ["/", "/search", "/explore", "/groups", "/profile"];

function registerSW() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    });
  }
}

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => { registerSW(); }, []);

  const currentIdx = NAV_ORDER.indexOf(location.pathname);

  const onSwipeLeft = useCallback(() => {
    if (currentIdx >= 0 && currentIdx < NAV_ORDER.length - 1) {
      navigate(NAV_ORDER[currentIdx + 1]);
    }
  }, [currentIdx, navigate]);

  const onSwipeRight = useCallback(() => {
    if (currentIdx > 0) {
      navigate(NAV_ORDER[currentIdx - 1]);
    } else if (currentIdx === -1) {
      navigate(-1);
    }
  }, [currentIdx, navigate]);

  // Swipe navigation disabled by default — users must use BottomNav to prevent accidental page swipes
  const swipeRef = useSwipeGesture(onSwipeLeft, onSwipeRight, { threshold: 120, enableSwipe: false });

  return (
    <div ref={swipeRef} className="app-container bg-background">
      <main className="pb-24 max-w-lg mx-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}