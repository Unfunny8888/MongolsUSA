/**
 * FeedItem — community commerce card with 3 visual weights.
 * Listings feel like posts from real local people, not catalog entries.
 */
import { useNavigate } from "react-router-dom";
import { MapPin, Briefcase, CalendarDays, Heart, MessageCircle, Flame, Wrench, Clock, Home, Car, Sparkles, ChevronRight, ShieldCheck } from "lucide-react";
import { useState, memo } from "react";

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
  jobs:      { icon: Briefcase,     label: "Job",      color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-950/40"    },
  events:    { icon: CalendarDays,  label: "Event",    color: "text-violet-600",  bg: "bg-violet-50 dark:bg-violet-950/40"},
  services:  { icon: Wrench,        label: "Service",  color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-950/40"  },
  housing:   { icon: Home,          label: "Housing",  color: "text-rose-600",    bg: "bg-rose-50 dark:bg-rose-950/40"    },
  cars:      { icon: Car,           label: "Vehicle",  color: "text-orange-600",  bg: "bg-orange-50 dark:bg-orange-950/40"},
  community: { icon: MessageCircle, label: "Community",color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/40"},
  default:   { icon: Flame,         label: "Listing",  color: "text-primary",     bg: "bg-primary/8"                      },
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
  const dim = size === "xs" ? "w-5 h-5" : "w-6 h-6";
  return (
    <img
      src={src || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=32&h=32&fit=crop&crop=face"}
      alt={name}
      className={`${dim} rounded-full object-cover border border-border/20 shrink-0`}
    />
  );
}

// Subtle seller trust signal — only shown when meaningful
function SellerTrust({ listing }) {
  if (listing.is_verified) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600/80">
        <ShieldCheck className="w-2.5 h-2.5" strokeWidth={2.5} />
        Verified
      </span>
    );
  }
  if ((listing.saves || 0) > 5) {
    return <span className="text-[10px] text-muted-foreground/60">Active seller</span>;
  }
  return null;
}

function formatPrice(listing) {
  if (listing.price_type === "free") return "Free";
  if (!listing.price) return null;
  const p = `$${listing.price.toLocaleString()}`;
  if (listing.price_type === "hourly") return `${p}/hr`;
  if (listing.price_type === "monthly") return `${p}/mo`;
  return p;
}

// Inline social action bar
function SocialBar({ listing, onAsk }) {
  const [saved, setSaved] = useState(false);
  const interested = (listing.saves || 0) + (listing.comment_count || 0);
  return (
    <div className="flex items-center gap-2 pt-2 border-t border-border/10">
      <button
        onClick={e => { e.stopPropagation(); onAsk(); }}
        className="flex items-center gap-1.5 text-[11px] font-semibold text-primary/80 bg-primary/6 hover:bg-primary/10 active:bg-primary/15 rounded-lg px-2.5 py-1.5 transition-colors"
      >
        <MessageCircle className="w-3 h-3" strokeWidth={2.5} />
        Ask
      </button>
      <button
        onClick={e => { e.stopPropagation(); setSaved(s => !s); }}
        className={`flex items-center gap-1.5 text-[11px] font-semibold rounded-lg px-2.5 py-1.5 transition-colors ${
          saved ? "text-rose-500 bg-rose-50 dark:bg-rose-950/30" : "text-muted-foreground bg-secondary/50 hover:bg-secondary"
        }`}
      >
        <Heart className={`w-3 h-3 ${saved ? "fill-rose-500" : ""}`} strokeWidth={2.5} />
        Save
      </button>
      {interested > 0 && (
        <span className="ml-auto text-[10px] text-muted-foreground/70">
          {interested} {interested === 1 ? "person" : "people"} interested
        </span>
      )}
    </div>
  );
}

// Inline ask input
function InlineAsk({ onClose }) {
  const [text, setText] = useState("");
  function submit(e) { e.stopPropagation(); if (text.trim()) onClose(); }
  return (
    <div onClick={e => e.stopPropagation()} className="pt-2 border-t border-border/10">
      <div className="flex items-center gap-2 bg-secondary/40 rounded-xl px-3 py-1.5">
        <input
          autoFocus
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit(e)}
          placeholder="Ask about this…"
          className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/50 outline-none min-h-[28px]"
        />
        <button onClick={submit} className="text-primary text-[11px] font-semibold shrink-0 disabled:opacity-30" disabled={!text.trim()}>
          Send
        </button>
      </div>
    </div>
  );
}

// ── HERO ──────────────────────────────────────────────────────────────────
function HeroCard({ listing, onClick }) {
  const [asking, setAsking] = useState(false);
  const hasImg = listing.images?.length > 0;
  return (
    <div className="bg-card rounded-2xl overflow-hidden border border-border/15 active:scale-[0.99] active:opacity-90 transition-all duration-150">
      <div onClick={onClick} className="cursor-pointer">
        <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
          {hasImg ? (
            <img src={listing.images[0]} alt={listing.title} loading="lazy" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-secondary/40" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            {listing.is_featured ? (
              <span className="flex items-center gap-1 bg-amber-500/90 rounded-full px-2 py-0.5 text-[10px] font-bold text-white">
                <Sparkles className="w-2.5 h-2.5" strokeWidth={2.5} /> Featured
              </span>
            ) : (
              <span className="flex items-center gap-1 bg-orange-500/90 rounded-full px-2 py-0.5 text-[10px] font-bold text-white">
                <Flame className="w-2.5 h-2.5" strokeWidth={2.5} /> Trending
              </span>
            )}
          </div>
          {listing.price && (
            <div className="absolute top-3 right-3 bg-black/50 backdrop-blur rounded-lg px-2 py-0.5 font-bold text-[13px] text-white">
              ${listing.price.toLocaleString()}
            </div>
          )}
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
            <p className="text-white font-bold text-[15px] leading-snug line-clamp-2">{listing.title}</p>
          </div>
        </div>
      </div>
      <div className="px-3.5 pb-3 pt-2.5">
        {asking
          ? <InlineAsk onClose={() => setAsking(false)} />
          : <SocialBar listing={listing} onAsk={() => setAsking(true)} />
        }
      </div>
    </div>
  );
}

// ── STANDARD ──────────────────────────────────────────────────────────────
function StandardCard({ listing, onClick }) {
  const [asking, setAsking] = useState(false);
  const hasImg = listing.images?.length > 0;
  const price = formatPrice(listing);
  return (
    <div className="bg-card rounded-2xl border border-border/15 overflow-hidden active:scale-[0.99] active:opacity-90 transition-all duration-150">
      {hasImg && (
        <div onClick={onClick} className="relative w-full cursor-pointer" style={{ aspectRatio: "16/9" }}>
          <img src={listing.images[0]} alt={listing.title} loading="lazy" className="w-full h-full object-cover" />
          {listing.is_featured && (
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-amber-500/90 rounded-full px-2 py-0.5 text-[10px] font-bold text-white">
              <Sparkles className="w-2.5 h-2.5" /> Featured
            </div>
          )}
          {price && (
            <div className="absolute bottom-2.5 right-2.5 bg-card/90 backdrop-blur rounded-lg px-2.5 py-1 font-bold text-[13px] text-foreground">
              {price}
            </div>
          )}
        </div>
      )}
      <div className="px-3.5 pt-3 pb-3 space-y-2">
        <div onClick={onClick} className="flex items-center justify-between cursor-pointer">
          <TypePill category={listing.category} />
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock className="w-2.5 h-2.5" />{timeAgo(listing.created_date)}
          </span>
        </div>
        <div onClick={onClick} className="cursor-pointer">
          <p className="text-[14px] font-bold leading-snug line-clamp-2 text-foreground">{listing.title}</p>
          {listing.description && (
            <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2 mt-1">{listing.description}</p>
          )}
        </div>
        <div onClick={onClick} className="flex items-center gap-2 cursor-pointer">
          <Avatar src={listing.poster_avatar} name={listing.poster_name} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-[11px] font-semibold text-foreground leading-none">{listing.poster_name || "Member"}</p>
              <SellerTrust listing={listing} />
            </div>
            {listing.location_city && (
              <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
                <MapPin className="w-2.5 h-2.5" />Posted in {listing.location_city}
              </p>
            )}
          </div>
          {!hasImg && price && <span className="text-[14px] font-bold text-primary">{price}</span>}
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />
        </div>
        {asking
          ? <InlineAsk onClose={() => setAsking(false)} />
          : <SocialBar listing={listing} onAsk={() => setAsking(true)} />
        }
      </div>
    </div>
  );
}

// ── COMPACT ───────────────────────────────────────────────────────────────
function CompactCard({ listing, onClick }) {
  const [asking, setAsking] = useState(false);
  const hasImg = listing.images?.length > 0;
  const price = formatPrice(listing);
  const interested = (listing.saves || 0) + (listing.comment_count || 0);
  return (
    <div className="bg-card rounded-xl border border-border/15 transition-all duration-150">
      <div onClick={onClick} className="flex items-start gap-3 px-3 pt-3 pb-2 cursor-pointer active:opacity-80">
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <TypePill category={listing.category} />
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock className="w-2.5 h-2.5" />{timeAgo(listing.created_date)}
            </span>
          </div>
          <p className="text-[13px] font-bold leading-snug line-clamp-2 text-foreground">{listing.title}</p>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Avatar src={listing.poster_avatar} name={listing.poster_name} size="xs" />
            <span className="text-[10px] text-muted-foreground">{listing.poster_name || "Member"}</span>
            <SellerTrust listing={listing} />
            {listing.location_city && (
              <>
                <span className="text-muted-foreground/30">·</span>
                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                  <MapPin className="w-2.5 h-2.5" />{listing.location_city}
                </span>
              </>
            )}
            {price && <span className="ml-auto text-[12px] font-bold text-primary">{price}</span>}
          </div>
        </div>
        {hasImg && (
          <img
            src={listing.images[0]}
            alt={listing.title}
            loading="lazy"
            className="w-16 h-16 rounded-lg object-cover shrink-0 border border-border/15"
          />
        )}
      </div>
      <div className="px-3 pb-2.5">
        {asking ? (
          <InlineAsk onClose={() => setAsking(false)} />
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={e => { e.stopPropagation(); setAsking(true); }}
              className="text-[11px] font-semibold text-primary/70 flex items-center gap-1"
            >
              <MessageCircle className="w-3 h-3" strokeWidth={2.5} />
              {interested > 0 ? `${interested} asked` : "Ask about this"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FeedItem({ listing, variant = "standard" }) {
  const navigate = useNavigate();
  const onClick = () => navigate(`/listing/${listing.id}`);
  if (variant === "hero")    return <HeroCard listing={listing} onClick={onClick} />;
  if (variant === "compact") return <CompactCard listing={listing} onClick={onClick} />;
  return <StandardCard listing={listing} onClick={onClick} />;
}

export default memo(FeedItem);