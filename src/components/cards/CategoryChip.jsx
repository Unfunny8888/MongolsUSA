import { motion } from "framer-motion";
import { Car, Briefcase, Home, Wrench, Star, Cpu, Users, CalendarDays, Globe, ShoppingBag } from "lucide-react";

const ICON_MAP = {
  car: Car,
  briefcase: Briefcase,
  home: Home,
  wrench: Wrench,
  star: Star,
  cpu: Cpu,
  users: Users,
  calendar: CalendarDays,
  globe: Globe,
  bag: ShoppingBag,
};

export default function CategoryChip({ category, index = 0, onClick, isSelected = false }) {
  const Icon = ICON_MAP[category.icon] || Globe;
  return (
    <motion.button
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.18 }}
      whileTap={{ scale: 0.93 }}
      onClick={() => onClick?.(category)}
      className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 min-h-[36px] ${
        isSelected
          ? "bg-primary text-primary-foreground shadow-sm"
          : "bg-secondary/60 text-muted-foreground hover:bg-secondary active:bg-secondary"
      }`}
    >
      <Icon
        className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-primary-foreground' : 'text-foreground/60'}`}
        strokeWidth={2}
      />
      <span className={`text-[12px] font-semibold tracking-tight ${isSelected ? 'text-primary-foreground' : 'text-foreground/80'}`}>
        {category.label}
      </span>
    </motion.button>
  );
}