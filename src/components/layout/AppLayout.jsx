import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import BottomNav from "./BottomNav";




function registerSW() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    });
  }
}

export default function AppLayout() {
  useEffect(() => { registerSW(); }, []);

  return (
    <div className="app-container bg-background">
      <main className="pb-24 max-w-lg mx-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}