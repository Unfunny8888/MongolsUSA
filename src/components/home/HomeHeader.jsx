import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Mic, Sun } from "lucide-react";
import { motion } from "framer-motion";

export default function HomeHeader() {
  const navigate = useNavigate();
  const [city, setCity] = useState("Maryville, TN");
  const [user, setUser] = useState(null);
  const [greeting, setGreeting] = useState("👋");

  useEffect(() => {
    async function load() {
      const authed = await base44.auth.isAuthenticated();
      if (authed) {
        const me = await base44.auth.me();
        setUser(me);
        if (me.preferred_city) setCity(me.preferred_city);
      }

      // Generate AI greeting based on time and location
      const hour = new Date().getHours();
      const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a SHORT, warm, single-line greeting in Mongolian for ${timeOfDay}. Include a relevant emoji. Format: "[Greeting] [emoji]" Keep it under 15 words. Be natural and friendly.`,
      });
      setGreeting(response);
    }
    load();
  }, []);

  return (
    <div className="px-4 pt-4 pb-6 space-y-4">
      {/* Greeting & Weather */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{greeting}</p>
          <h1 className="text-4xl font-black text-foreground leading-tight">
            {user?.full_name || "NomadLink"}
          </h1>
          <div className="flex items-center gap-2 mt-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-foreground font-medium">{city}</span>
            <span className="text-muted-foreground">• {new Date().toLocaleDateString('mn-MN', { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-border/50 flex items-center gap-2 shadow-sm"
        >
          <Sun className="w-5 h-5 text-amber-500" />
          <span className="text-sm font-semibold text-foreground">45°F</span>
        </motion.div>
      </div>

      {/* Search Bar */}
      <div className="relative mt-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Chicago Mongolian events"
          onFocus={() => navigate("/search")}
          className="w-full pl-12 pr-12 py-4 rounded-full bg-white dark:bg-slate-800 border border-border/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-smooth shadow-sm"
        />
        <button className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-secondary/50 rounded-lg transition-smooth">
          <Mic className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}