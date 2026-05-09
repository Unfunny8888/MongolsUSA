/**
 * CommunityTrustBadge — lightweight, calm trust signal.
 * Renders one small badge. Stack multiples for layered credibility.
 */
import { ShieldCheck, Users, MapPin, Clock, Star, MessageCircle, Phone, CheckCircle2 } from "lucide-react";

const VARIANTS = {
  verified_local:     { icon: ShieldCheck,    label: "Verified Local",         color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
  verified_business:  { icon: CheckCircle2,   label: "Verified Business",      color: "text-sky-700 dark:text-sky-400",         bg: "bg-sky-50 dark:bg-sky-950/40"         },
  community_pick:     { icon: Users,          label: "Community Pick",         color: "text-violet-700 dark:text-violet-400",   bg: "bg-violet-50 dark:bg-violet-950/40"   },
  popular_nearby:     { icon: MapPin,         label: "Popular Nearby",         color: "text-rose-700 dark:text-rose-400",       bg: "bg-rose-50 dark:bg-rose-950/40"       },
  active_member:      { icon: Clock,          label: "Active Member",          color: "text-amber-700 dark:text-amber-400",     bg: "bg-amber-50 dark:bg-amber-950/40"     },
  phone_verified:     { icon: Phone,          label: "Phone Verified",         color: "text-teal-700 dark:text-teal-400",       bg: "bg-teal-50 dark:bg-teal-950/40"       },
  responsive:         { icon: MessageCircle,  label: "Responds Quickly",       color: "text-blue-700 dark:text-blue-400",       bg: "bg-blue-50 dark:bg-blue-950/40"       },
  top_rated:          { icon: Star,           label: "Top Rated",              color: "text-amber-700 dark:text-amber-400",     bg: "bg-amber-50 dark:bg-amber-950/40"     },
};

export default function CommunityTrustBadge({ variant, customLabel, size = "sm" }) {
  const cfg = VARIANTS[variant];
  if (!cfg) return null;
  const Icon = cfg.icon;
  const label = customLabel || cfg.label;

  if (size === "xs") {
    return (
      <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium ${cfg.color}`}>
        <Icon className="w-2.5 h-2.5" strokeWidth={2.5} />
        {label}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
      <Icon className="w-2.5 h-2.5" strokeWidth={2.5} />
      {label}
    </span>
  );
}