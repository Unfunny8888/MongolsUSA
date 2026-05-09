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
    <button
      onClick={() => onClick?.(category)}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap transition-all duration-150 shrink-0 ${
        isSelected
          ? "bg-foreground text-background"
          : "bg-secondary/50 text-muted-foreground hover:bg-secondary active:bg-secondary/80"
      }`}
    >
      <Icon className={`w-3 h-3 shrink-0 ${isSelected ? "opacity-90" : "opacity-50"}`} strokeWidth={2} />
      <span className={`text-[11px] font-semibold tracking-tight leading-none ${
        isSelected ? "text-background" : "text-foreground/70"
      }`}>
        {category.label}
      </span>
    </button>
  );
}