import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import AIAssistantBubble from "../common/AIAssistantBubble";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <main className="pb-24 max-w-lg mx-auto">
        <Outlet />
      </main>
      <AIAssistantBubble />
      <BottomNav />
    </div>
  );
}