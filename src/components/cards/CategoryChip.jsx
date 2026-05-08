import { motion } from "framer-motion";
import { ICONS } from "../../lib/mockData";

export default function CategoryChip({ category, index = 0, onClick, isSelected = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <button
        onClick={() => onClick?.(category)}
        className={`flex items-center gap-2 px-6 py-3 rounded-full border transition-smooth active:scale-95 ${
          isSelected
            ? "bg-foreground text-background border-foreground"
            : "bg-white dark:bg-slate-800 border-border/50 hover:bg-secondary/50"
        }`}
      >
        <span className="text-lg">{ICONS[category.icon] || "•"}</span>
        <div className="text-left">
          <p className="text-sm font-semibold">{category.label}</p>
          <p className={`text-[11px] ${isSelected ? "opacity-75" : "text-muted-foreground"}`}>{category.labelMn}</p>
        </div>
      </button>
    </motion.div>
  );
}