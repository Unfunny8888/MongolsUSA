import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Bell, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function HomeHeader() {
  const [city, setCity] = useState("Chicago");
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    async function load() {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) return;
      const me = await base44.auth.me();
      if (me.preferred_city) setCity(me.preferred_city);
      const notifs = await base44.entities.Notification.filter({ user_email: me.email, is_read: false }, "-created_date", 5).catch(() => []);
      setUnread(notifs.length);
    }
    load();
  }, []);

  return (
    <div className="glass sticky top-0 z-40 border-b border-border/30">
      <div className="px-4 py-3 flex items-center justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xl font-extrabold tracking-tight"
          >
            <span className="text-primary">Nomad</span>
            <span className="text-foreground">Link</span>
          </motion.h1>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
            <MapPin className="w-3 h-3" />
            <span>{city}</span>
          </div>
        </div>
        <Link to="/notifications" className="relative">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-smooth">
            <Bell className="w-5 h-5 text-foreground" />
          </div>
          {unread > 0 && <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 border-2 border-background flex items-center justify-center"><span className="text-[8px] text-white font-bold">{unread}</span></div>}
        </Link>
      </div>
    </div>
  );
}