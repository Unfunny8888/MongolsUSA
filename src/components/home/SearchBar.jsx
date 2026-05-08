import { Search, Mic } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function SearchBar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="px-4 py-3"
    >
      <Link to="/search" className="block">
        <div className="flex items-center gap-3 bg-secondary/70 rounded-2xl px-4 py-3.5 border border-border/50 hover:border-primary/30 transition-smooth group">
          <Search className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-smooth" />
          <span className="text-sm text-muted-foreground flex-1">
            Search jobs, housing, cars...
          </span>
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Mic className="w-4 h-4 text-primary" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}