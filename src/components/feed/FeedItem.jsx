import { useNavigate } from "react-router-dom";
import { MapPin, Briefcase, CalendarDays, Eye, Heart, MessageCircle, Flame, Wrench, Clock } from "lucide-react";
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

const TYPE_LABELS = {
  jobs:      { icon: Briefcase,  label: "Job",     color: "text-blue-500",   bg: "bg-blue-50 dark:bg-blue-950/40" },
  events:    { icon: CalendarDays, label: "Event", color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/40" },
  services:  { icon: Wrench,    label: "Service",  color: "text-amber-500",  bg: "bg-amber-50 dark:bg-amber-950/40" },
  housing:   { icon: MapPin,    label: "Housing",  color: "text-rose-500",   bg: "bg-rose-50 dark:bg-rose-950/40" },
  cars:      { icon: Flame,     label: "Vehicle",  color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/40" },
  default:   { icon: Flame,     label: "Listing",  color: "text-primary",    bg: "bg-primary/8" },
};

function FeedItem({ listing, isTrending = false }) {
  const navigate = useNavigate();
  const hasImg = listing.images?.length > 0;
  const { icon: TypeIcon, label: typeLabel, color: typeColor, bg: typeBg } =
    TYPE_LABELS[listing.category] || TYPE_LABELS.default;

  const formatPrice = () => {
    if (listing.price_type === "free") return "Free";
    if (!listing.price) return null;
    const s = { hourly: "/hr", monthly: "/mo" };
    return `$${listing.price.toLocaleString()}${s[listing.price_type] || ""}`;
  };
  const price = formatPrice();

  return (
    <div
      onClick={() => navigate(`/listing/${listing.id}`)}
      className="bg-card border border-border/25 rounded-2xl overflow-hidden active:scale-[0.99] active:opacity-90 transition-all duration-150 cursor-pointer"
    >
      {/* Image */}
      {hasImg && (
        <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
          <img
            src={listing.images[0]}
            alt={listing.title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
          {isTrending && (
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5">
              <Flame className="w-2.5 h-2.5 text-orange-400" strokeWidth={2.5} />
              <span className="text-[10px] font-bold text-white">Trending</span>
            </div>
          )}
          {price && (
            <div className="absolute bottom-2.5 right-2.5 bg-card/90 backdrop-blur rounded-lg px-2 py-0.5 font-bold text-[13px] text-foreground">
              {price}
            </div>
          )}
        </div>
      )}

      {/* Body */}
      <div className="px-3.5 pt-3 pb-3">
        {/* Type pill + time */}
        <div className="flex items-center justify-between mb-1.5">
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${typeBg} ${typeColor}`}>
            <TypeIcon className="w-2.5 h-2.5" strokeWidth={2.5} />
            {typeLabel}
          </span>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock className="w-2.5 h-2.5" />
            {timeAgo(listing.created_date)}
          </div>
        </div>

        {/* Title */}
        <p className="text-[14px] font-bold leading-snug line-clamp-2 text-foreground mb-1">
          {listing.title}
        </p>

        {/* Description */}
        {listing.description && (
          <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2 mb-2">
            {listing.description}
          </p>
        )}

        {/* Footer: poster + location + engagement */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={listing.poster_avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=32&h=32&fit=crop&crop=face"}
              alt={listing.poster_name}
              className="w-6 h-6 rounded-full object-cover border border-border/30"
            />
            <div>
              <p className="text-[11px] font-semibold text-foreground leading-none">{listing.poster_name || "Member"}</p>
              {listing.location_city && (
                <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
                  <MapPin className="w-2.5 h-2.5" />{listing.location_city}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-muted-foreground">
            <span className="flex items-center gap-1 text-[11px]"><Eye className="w-3 h-3" />{listing.views || 0}</span>
            <span className="flex items-center gap-1 text-[11px]"><Heart className="w-3 h-3" />{listing.saves || 0}</span>
            <span className="flex items-center gap-1 text-[11px]"><MessageCircle className="w-3 h-3" />{listing.comment_count || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(FeedItem);