import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";


export default function AppLayout() {
  return (
    <div className="app-container bg-background">
      <main className="pb-24 max-w-lg mx-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}