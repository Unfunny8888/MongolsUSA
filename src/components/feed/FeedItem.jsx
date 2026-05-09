/**
 * FeedItem — unified feed card with 3 visual weights:
 *   "hero"     — large image, full engagement overlay (trending anchors)
 *   "standard" — 16:9 image + content body (default listings)
 *   "compact"  — text-first, image thumbnail on right (jobs, services, quick posts)
 */
import { useNavigate } from "react-router-dom";
import { MapPin, Briefcase, CalendarDays, Eye, Heart, MessageCircle, Flame, Wrench, Clock, Home, Car } from "lucide-react";
import { memo } from "react";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "Just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

const TYPE_CONFIG = {
  jobs:      { icon: Briefcase,    label: "Job",     color: "text-blue-600",   bg: "bg-blue-50 dark:bg-blue-950/40"   },
  events:    { icon: CalendarDays, label: "Event",   color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950/40" },
  services:  { icon: Wrench,       label: "Service", color: "text-amber-600",  bg: "bg-amber-50 dark:bg-amber-950/40" },
  housing:   { icon: Home,         label: "Housing", color: "text-rose-600",   bg: "bg-rose-50 dark:bg-rose-950/40"   },
  cars:      { icon: Car,          label: "Vehicle", color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/40" },
  community: { icon: MessageCircle,label: "Community",color: "text-emerald-600",bg: "bg-emerald-50 dark:bg-emerald-950/40"},
  default:   { icon: Flame,        label: "Listing", color: "text-primary",    bg: "bg-primary/8"                     },
};

function TypePill({ category }) {
  const cfg = TYPE_CONFIG[category] || TYPE_CONFIG.default;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${cfg.bg} ${cfg.color}`}>
      <Icon className="w-2.5 h-2.5" strokeWidth={2.5} />
      {cfg.label}
    </span>
  );
}

function Avatar({ src, name, size = "sm" }) {
  const dim = size === "xs" ? "w-5 h-5" : "w-7 h-7";
  return (
    <img
      src={src || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=32&h=32&fit=crop&crop=face"}
      alt={name}
      className={`${dim} rounded-full object-cover border border-border/30 shrink-0`}
    />
  );
}

function EngagementRow({ listing, light = false }) {
  const cls = light ? "text-white/70" : "text-muted-foreground";
  return (
    <div className={`flex items-center gap-3 text-[11px] ${cls}`}>
      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{listing.views || 0}</span>
      <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{listing.saves || 0}</span>
      <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{listing.comment_count || 0}</span>
    </div>
  );
}

// ── HERO: full-bleed image with text overlay ──────────────────────────────
function HeroCard({ listing, onClick }) {
  const hasImg = listing.images?.length > 0;
  return (
    <div
      onClick={onClick}
      className="bg-card rounded-2xl overflow-hidden border border-border/20 active:scale-[0.99] active:opacity-90 transition-all duration-150 cursor-pointer"
    >
      <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
        {hasImg ? (
          <img src={listing.images[0]} alt={listing.title} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-secondary/40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        {/* Trending badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1 bg-orange-500/90 rounded-full px-2 py-0.5">
          <Flame className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />
          <span className="text-[10px] font-bold text-white">Trending</span>
        </div>
        {listing.price && (
          <div className="absolute top-3 right-3 bg-black/50 backdrop-blur rounded-lg px-2 py-0.5 font-bold text-[13px] text-white">
            ${listing.price.toLocaleString()}
          </div>
        )}
        {/* Overlay content */}
        <div className="absolute bottom-0 left-0 right-0 px-3.5 pb-3.5">
          <div className="flex items-center gap-2 mb-1.5">
            <Avatar src={listing.poster_avatar} name={listing.poster_name} size="xs" />
            <span className="text-[11px] font-semibold text-white/85">{listing.poster_name || "Member"}</span>
            {listing.location_city && (
              <span className="flex items-center gap-0.5 text-[10px] text-white/55 ml-auto">
                <MapPin className="w-2.5 h-2.5" />{listing.location_city}
              </span>
            )}
          </div>
          <p className="text-white font-bold text-[15px] leading-snug line-clamp-2 mb-2">{listing.title}</p>
          <EngagementRow listing={listing} light />
        </div>
      </div>
    </div>
  );
}

// ── STANDARD: image top, content body ────────────────────────────────────
function StandardCard({ listing, onClick }) {
  const hasImg = listing.images?.length > 0;
  const price = listing.price_type === "free" ? "Free" : listing.price ? `$${listing.price.toLocaleString()}${listing.price_type === "hourly" ? "/hr" : listing.price_type === "monthly" ? "/mo" : ""}` : null;
  return (
    <div
      onClick={onClick}
      className="bg-card rounded-2xl border border-border/25 overflow-hidden active:scale-[0.99] active:opacity-90 transition-all duration-150 cursor-pointer"
    >
      {hasImg && (
        <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
          <img src={listing.images[0]} alt={listing.title} loading="lazy" className="w-full h-full object-cover" />
          {price && (
            <div className="absolute bottom-2.5 right-2.5 bg-card/90 backdrop-blur rounded-lg px-2.5 py-1 font-bold text-[13px] text-foreground">
              {price}
            </div>
          )}
        </div>
      )}
      <div className="px-3.5 pt-3 pb-3 space-y-2">
        <div className="flex items-center justify-between">
          <TypePill category={listing.category} />
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock className="w-2.5 h-2.5" />{timeAgo(listing.created_date)}
          </span>
        </div>
        <p className="text-[14px] font-bold leading-snug line-clamp-2 text-foreground">{listing.title}</p>
        {listing.description && (
          <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2">{listing.description}</p>
        )}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center gap-2">
            <Avatar src={listing.poster_avatar} name={listing.poster_name} />
            <div>
              <p className="text-[11px] font-semibold text-foreground leading-none">{listing.poster_name || "Member"}</p>
              {listing.location_city && (
                <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
                  <MapPin className="w-2.5 h-2.5" />{listing.location_city}
                </p>
              )}
            </div>
          </div>
          <EngagementRow listing={listing} />
        </div>
      </div>
    </div>
  );
}

// ── COMPACT: text-first, optional thumbnail right ─────────────────────────
function CompactCard({ listing, onClick }) {
  const hasImg = listing.images?.length > 0;
  const price = listing.price_type === "free" ? "Free" : listing.price ? `$${listing.price.toLocaleString()}${listing.price_type === "hourly" ? "/hr" : ""}` : null;
  return (
    <div
      onClick={onClick}
      className="bg-card rounded-xl border border-border/20 active:bg-secondary/30 active:scale-[0.99] transition-all duration-150 cursor-pointer"
    >
      <div className="flex items-start gap-3 p-3">
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2">
            <TypePill category={listing.category} />
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock className="w-2.5 h-2.5" />{timeAgo(listing.created_date)}
            </span>
          </div>
          <p className="text-[13px] font-bold leading-snug line-clamp-2 text-foreground">{listing.title}</p>
          {price && <p className="text-[12px] font-bold text-primary">{price}</p>}
          <div className="flex items-center gap-2">
            <Avatar src={listing.poster_avatar} name={listing.poster_name} size="xs" />
            <span className="text-[10px] text-muted-foreground">{listing.poster_name || "Member"}</span>
            {listing.location_city && (
              <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                <MapPin className="w-2.5 h-2.5" />{listing.location_city}
              </span>
            )}
          </div>
        </div>
        {hasImg && (
          <img
            src={listing.images[0]}
            alt={listing.title}
            loading="lazy"
            className="w-16 h-16 rounded-lg object-cover shrink-0 border border-border/20"
          />
        )}
      </div>
    </div>
  );
}

function FeedItem({ listing, variant = "standard" }) {
  const navigate = useNavigate();
  const onClick = () => navigate(`/listing/${listing.id}`);

  if (variant === "hero") return <HeroCard listing={listing} onClick={onClick} />;
  if (variant === "compact") return <CompactCard listing={listing} onClick={onClick} />;
  return <StandardCard listing={listing} onClick={onClick} />;
}

export default memo(FeedItem);