/**
 * LocalContextTag — subtle inline "Trending in Chicago" style label.
 * Tiny, calm, integrated. Not a banner.
 */
import { MapPin, TrendingUp, Users, Zap } from "lucide-react";

const VARIANTS = {
  trending:  { icon: TrendingUp, prefix: "Trending in",   color: "text-orange-600/70 dark:text-orange-400/70" },
  nearby:    { icon: MapPin,     prefix: "Nearby ·",      color: "text-primary/60" },
  popular:   { icon: Users,      prefix: "Popular in",    color: "text-violet-600/70 dark:text-violet-400/70" },
  active:    { icon: Zap,        prefix: "Active in",     color: "text-emerald-600/70 dark:text-emerald-400/70" },
};

export default function LocalContextTag({ variant = "nearby", city, label }) {
  const cfg = VARIANTS[variant] || VARIANTS.nearby;
  const Icon = cfg.icon;
  const text = label || (city ? `${cfg.prefix} ${city}` : cfg.prefix.replace(" ·", ""));

  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${cfg.color}`}>
      <Icon className="w-2.5 h-2.5 shrink-0" strokeWidth={2.5} />
      {text}
    </span>
  );
}