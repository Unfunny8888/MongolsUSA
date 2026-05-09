import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Share2, MapPin, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useCallback, useEffect, memo } from "react";
import { useTapGesture } from "@/hooks/useTapGesture";
import LocationLabel from "../common/LocationLabel";
import ReputationBadge from "../common/ReputationBadge";
import { base44 } from "@/api/base44Client";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

function formatPrice(listing) {
  if (listing.price_type === "free") return "Free";
  if (!listing.price) return null;
  const p = `$${listing.price.toLocaleString()}`;
  const suffixes = { hourly: "/hr", monthly: "/mo", weekly: "/wk", yearly: "/yr" };
  const suffix = suffixes[listing.price_type] || "";
  return `${p}${suffix}`;
}

function ListingCard({ listing, index = 0, locationRelevance, userCity }) {
  const navigate = useNavigate();
  const handleTap = useCallback(() => navigate(`/listing/${listing.id}`), [navigate, listing.id]);
  const { onTouchStart, onTouchMove, onTouchEnd } = useTapGesture(handleTap);
  const hasImage = listing.images?.length > 0;
  const price = formatPrice(listing);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [posterReputation, setPosterReputation] = useState(null);

  useEffect(() => {
    async function loadReputation() {
      if (listing.author_email) {
        const rep = await base44.entities.UserReputation.filter({ user_email: listing.author_email });
        if (rep.length > 0) setPosterReputation(rep[0]);
      }
    }
    loadReputation();
  }, [listing.author_email]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      className="w-full"
    >
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="bg-card rounded-2xl border border-border/30 overflow-hidden shadow-sm active:shadow-none transition-all duration-200 cursor-pointer active:scale-[0.985]"
        style={{ willChange: 'transform', transform: 'translateZ(0)' }}
      >
        {/* Image section */}
        <div className="relative w-full bg-secondary/50" style={{ aspectRatio: '4/3' }}>
          {hasImage ? (
            <>
            {!imageLoaded && <div className="absolute inset-0 bg-secondary/50 animate-pulse" />}
            <img
             src={listing.images[0]}
             alt={listing.title}
             onLoad={() => setImageLoaded(true)}
             className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
             loading="lazy"
            />
            {/* Location badge - top left */}
            {locationRelevance && (
              <div className="absolute top-3 left-3">
                <LocationLabel relevance={locationRelevance} />
              </div>
            )}
            {/* Price badge - top right */}
            {price && (
              <div className="absolute top-3 right-3 glass rounded-lg px-3 py-1.5 backdrop-blur font-bold text-base text-foreground shadow-lg">
                {price}
              </div>
            )}
            </>
          ) : (
            <div className="w-full h-full bg-secondary/30" />
          )}
        </div>

        {/* Content section */}
        <div className="p-4 space-y-2.5">
          {/* Seller info & location */}
          <div className="flex items-center gap-3">
            <img
              src={listing.poster_avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop"}
              alt={listing.poster_name}
              className="w-10 h-10 rounded-full object-cover border border-border/40"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground truncate">{listing.poster_name || "Seller"}</p>
                {posterReputation && <ReputationBadge reputation={posterReputation} size="xs" />}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{timeAgo(listing.created_date)}</span>
                {locationRelevance === 'same_city' && <span>• 📍 {listing.location_city}</span>}
              </div>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-[15px] font-bold leading-snug line-clamp-2 text-foreground">
            {listing.title}
          </h3>

          {/* No-image price display */}
          {!hasImage && price && (
            <p className="text-2xl font-bold text-primary">{price}</p>
          )}

          {/* Location */}
          {listing.location_city && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{listing.location_city}{listing.location_state ? `, ${listing.location_state}` : ""}</span>
            </div>
          )}

          {/* Description snippet */}
          {listing.description && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {listing.description}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 pt-2.5 border-t border-border/20">
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-secondary/40 active:bg-secondary/80 transition-colors duration-150 text-xs font-semibold text-muted-foreground active:scale-95">
              <Heart className="w-3.5 h-3.5" strokeWidth={2} />
              Save
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-secondary/40 active:bg-secondary/80 transition-colors duration-150 text-xs font-semibold text-muted-foreground active:scale-95">
              <MessageCircle className="w-3.5 h-3.5" strokeWidth={2} />
              Message
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-secondary/40 active:bg-secondary/80 transition-colors duration-150 text-xs font-semibold text-muted-foreground active:scale-95">
              <Share2 className="w-3.5 h-3.5" strokeWidth={2} />
              Share
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default memo(ListingCard);