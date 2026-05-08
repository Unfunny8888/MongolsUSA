import { Link } from "react-router-dom";
import { Bell, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function HomeHeader() {
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
            <span>Chicago, IL</span>
          </div>
        </div>
        <Link to="/profile" className="relative">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-smooth">
            <Bell className="w-5 h-5 text-foreground" />
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-background" />
        </Link>
      </div>
    </div>
  );
}