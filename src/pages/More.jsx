/**
 * More — clean category gateway. No feed, just navigation.
 */
import { useNavigate } from "react-router-dom";
import {
  CalendarDays, Car, ShoppingBag, Users,
  Smartphone, Navigation, Plane, LifeBuoy,
  BookOpen, Dumbbell, PawPrint, Shirt,
} from "lucide-react";

const CATEGORIES = [
  { label: "Events",       icon: CalendarDays, color: "text-violet-600",  bg: "bg-violet-50 dark:bg-violet-950/30",  route: "/events"      },
  { label: "Vehicles",     icon: Car,          color: "text-orange-600",  bg: "bg-orange-50 dark:bg-orange-950/30",  route: "/vehicles"    },
  { label: "Marketplace",  icon: ShoppingBag,  color: "text-sky-600",     bg: "bg-sky-50 dark:bg-sky-950/30",        route: "/marketplace" },
  { label: "Ride Share",   icon: Navigation,   color: "text-green-600",   bg: "bg-green-50 dark:bg-green-950/30",    route: "/rideshare"   },
  { label: "Community",    icon: Users,        color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30",route: "/community"   },
  { label: "Electronics",  icon: Smartphone,   color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-950/30",      route: "/marketplace" },
  { label: "Travel",       icon: Plane,        color: "text-indigo-600",  bg: "bg-indigo-50 dark:bg-indigo-950/30",  route: "/rideshare"   },
  { label: "Help",         icon: LifeBuoy,     color: "text-rose-600",    bg: "bg-rose-50 dark:bg-rose-950/30",      route: "/emergency"   },
  { label: "Education",    icon: BookOpen,     color: "text-teal-600",    bg: "bg-teal-50 dark:bg-teal-950/30",      route: "/marketplace" },
  { label: "Sports",       icon: Dumbbell,     color: "text-red-600",     bg: "bg-red-50 dark:bg-red-950/30",        route: "/events"      },
  { label: "Pets",         icon: PawPrint,     color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-950/30",    route: "/marketplace" },
  { label: "Fashion",      icon: Shirt,        color: "text-pink-600",    bg: "bg-pink-50 dark:bg-pink-950/30",      route: "/marketplace" },
];

export default function More() {
  const navigate = useNavigate();
  return (
    <div className="min-h-dvh px-4 pt-5 pb-8">
      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-4">
        Browse Categories
      </p>
      <div className="grid grid-cols-3 gap-3">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.label}
              onClick={() => navigate(cat.route)}
              className={`flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border border-border/10 active:scale-95 transition-transform ${cat.bg}`}
            >
              <div className="w-11 h-11 rounded-full bg-white/70 dark:bg-black/20 flex items-center justify-center">
                <Icon className={`w-5 h-5 ${cat.color}`} strokeWidth={2} />
              </div>
              <span className="text-[11px] font-semibold text-foreground/80 text-center leading-tight">
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}