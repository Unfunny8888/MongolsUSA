/**
 * More — all categories grid + sub-ecosystem pages.
 */
import { useNavigate } from "react-router-dom";
import { CalendarDays, Car, Users, Smartphone, GraduationCap, PawPrint,
         Shirt, Dumbbell, Flower2, LayoutGrid } from "lucide-react";

const ALL_CATS = [
  { id: "events",      label: "Events",       icon: CalendarDays, color: "text-violet-600",  bg: "bg-violet-50 dark:bg-violet-950/30", route: "/explore?category=events"      },
  { id: "cars",        label: "Vehicles",     icon: Car,          color: "text-orange-600",  bg: "bg-orange-50 dark:bg-orange-950/30", route: "/explore?category=cars"        },
  { id: "community",   label: "Community",    icon: Users,        color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30", route: "/groups"                    },
  { id: "electronics", label: "Electronics",  icon: Smartphone,   color: "text-sky-600",     bg: "bg-sky-50 dark:bg-sky-950/30",       route: "/explore?category=electronics" },
  { id: "education",   label: "Education",    icon: GraduationCap,color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-950/30",     route: "/explore?category=community"   },
  { id: "pets",        label: "Pets",         icon: PawPrint,     color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-950/30",   route: "/explore?category=community"   },
  { id: "fashion",     label: "Fashion",      icon: Shirt,        color: "text-pink-600",    bg: "bg-pink-50 dark:bg-pink-950/30",     route: "/explore?category=community"   },
  { id: "sports",      label: "Sports",       icon: Dumbbell,     color: "text-red-600",     bg: "bg-red-50 dark:bg-red-950/30",       route: "/explore?category=community"   },
  { id: "garden",      label: "Garden",       icon: Flower2,      color: "text-green-600",   bg: "bg-green-50 dark:bg-green-950/30",   route: "/explore?category=community"   },
  { id: "all",         label: "All Categories",icon: LayoutGrid,  color: "text-foreground",  bg: "bg-secondary",                       route: "/explore"                      },
];

export default function More() {
  const navigate = useNavigate();
  return (
    <div className="min-h-dvh px-4 py-5">
      <h1 className="text-[18px] font-bold text-foreground mb-1">More</h1>
      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-4">All Categories</p>
      <div className="grid grid-cols-3 gap-3">
        {ALL_CATS.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => navigate(cat.route)}
              className={`flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border border-border/15 active:scale-95 transition-transform ${cat.bg}`}
            >
              <div className={`w-11 h-11 rounded-full bg-white/70 dark:bg-black/20 flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${cat.color}`} strokeWidth={2} />
              </div>
              <span className="text-[11px] font-semibold text-foreground/80 text-center leading-tight">{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}