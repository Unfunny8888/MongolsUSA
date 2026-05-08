import { Car, Briefcase, Home, Wrench, Calendar, Smartphone, Users, Globe } from "lucide-react";
import { motion } from "framer-motion";

const ICON_MAP = {
  Car, Briefcase, Home, Wrench, Calendar, Smartphone, Users, globe: Globe
};

export default function CategoryChip({ category, index = 0, onClick, isSelected = false }) {
  const Icon = ICON_MAP[category.icon] || Car;

  const handleClick = () => {
    if (onClick) {
      onClick(category);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <button
        onClick={handleClick}
        className={`flex flex-col items-center gap-2 min-w-[72px] rounded-2xl p-2 transition-all ${
          isSelected
            ? "bg-primary/10 ring-2 ring-primary"
            : "hover:bg-secondary/50"
        }`}
      >
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg shadow-black/10 transition-smooth hover:scale-105 active:scale-95`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="text-center">
          <p className="text-[11px] font-semibold text-foreground leading-tight">{category.label}</p>
          <p className="text-[9px] text-muted-foreground">{category.labelMn}</p>
        </div>
      </button>
    </motion.div>
  );
}