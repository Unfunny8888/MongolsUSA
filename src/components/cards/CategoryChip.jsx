import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ICONS } from "../../lib/mockData";

export default function CategoryChip({ category, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        to={`/explore?category=${category.id}`}
        className="flex items-center gap-2 px-6 py-3 rounded-full bg-white dark:bg-slate-800 border border-border/50 hover:bg-secondary/50 transition-smooth active:scale-95"
      >
        <span className="text-lg">{ICONS[category.icon] || "•"}</span>
        <div>
          <p className="text-sm font-semibold text-foreground">{category.label}</p>
          <p className="text-[11px] text-muted-foreground">{category.labelMn}</p>
        </div>
      </Link>
    </motion.div>
  );
}