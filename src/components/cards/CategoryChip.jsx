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
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.2 }}
      whileTap={{ scale: 0.94 }}
      onClick={() => onClick?.(category)}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-full border whitespace-nowrap transition-all duration-200 active:scale-95 ${
        isSelected
          ? "bg-primary text-primary-foreground border-primary shadow-sm"
          : "bg-card border-border/50 text-foreground hover:bg-secondary/60"
      }`}
    >
      <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-primary-foreground' : 'text-primary'}`} strokeWidth={2} />
      <div className="text-left">
        <p className="text-[13px] font-semibold leading-tight">{category.label}</p>
        <p className={`text-[10px] leading-tight ${isSelected ? 'opacity-75' : 'text-muted-foreground'}`}>{category.labelMn}</p>
      </div>
    </motion.button>
  );
}