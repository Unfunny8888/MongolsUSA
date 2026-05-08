import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Bell } from "lucide-react";

export default function HomeHeader() {
  const navigate = useNavigate();
  const [city, setCity] = useState("Chicago");

  useEffect(() => {
    async function load() {
      const authed = await base44.auth.isAuthenticated();
      if (authed) {
        const me = await base44.auth.me();
        if (me.preferred_city) setCity(me.preferred_city);
      }
    }
    load();
  }, []);

  return (
    <div className="px-4 pt-4 pb-4 space-y-4">
      {/* Logo and Notification */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">
            <span className="text-primary">Nomad</span><span className="text-foreground">Link</span>
          </h1>
          <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
            <div className="w-4 h-4 flex items-center justify-center">📍</div>
            <span>{city}</span>
          </div>
        </div>
        <button className="p-3 rounded-full bg-secondary hover:bg-secondary/80 transition-smooth">
          <Bell className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="AI Search — jobs, housing, cars..."
          onFocus={() => navigate("/search")}
          className="w-full pl-12 pr-14 py-3 rounded-full bg-secondary dark:bg-slate-800 border-0 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-smooth"
        />
        <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-primary hover:bg-primary/90 transition-smooth">
          <div className="w-5 h-5 text-white flex items-center justify-center">✨</div>
        </button>
      </div>
    </div>
  );
}