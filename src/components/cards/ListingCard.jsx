import { Link } from "react-router-dom";
import { Heart, Eye, MapPin, Clock, Star, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

function formatPrice(listing) {
  if (listing.price_type === "free") return "Free";
  if (!listing.price) return null;
  const p = `$${listing.price.toLocaleString()}`;
  if (listing.price_type === "hourly") return `${p}/hr`;
  if (listing.price_type === "monthly") return `${p}/mo`;
  if (listing.price_type === "weekly") return `${p}/wk`;
  if (listing.price_type === "yearly") return `${p}/yr`;
  return p;
}

function getCategoryColor(cat) {
  const colors = {
    cars: "bg-blue-100 text-blue-700",
    jobs: "bg-emerald-100 text-emerald-700",
    housing: "bg-orange-100 text-orange-700",
    services: "bg-purple-100 text-purple-700",
    events: "bg-pink-100 text-pink-700",
    electronics: "bg-cyan-100 text-cyan-700",
    community: "bg-amber-100 text-amber-700",
  };
  return colors[cat] || "bg-gray-100 text-gray-700";
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function ListingCard({ listing, index = 0 }) {
  const hasImage = listing.images?.length > 0;
  const price = formatPrice(listing);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link to={`/listing/${listing.id}`} className="block group">
        {hasImage ? (
          /* Card WITH image */
          <div className="bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm hover:shadow-lg transition-smooth">
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute top-3 left-3 flex gap-2">
                {listing.is_featured && (
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg text-[10px] font-semibold gap-1">
                    <Star className="w-3 h-3" /> Featured
                  </Badge>
                )}
                {listing.is_boosted && (
                  <Badge className="bg-gradient-to-r from-primary to-emerald-600 text-white border-0 shadow-lg text-[10px] font-semibold gap-1">
                    <Zap className="w-3 h-3" /> Boosted
                  </Badge>
                )}
              </div>
              {price && (
                <div className="absolute bottom-3 right-3">
                  <div className="glass rounded-xl px-3 py-1.5 font-bold text-sm text-foreground shadow-lg">
                    {price}
                  </div>
                </div>
              )}
            </div>
            <div className="p-3.5">
              <h3 className="font-semibold text-sm leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors mb-2">
                {listing.title}
              </h3>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-2.5">
                {listing.location_city && (
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{listing.location_city}{listing.location_state ? `, ${listing.location_state}` : ""}</span>
                )}
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(listing.created_date)}</span>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className={`text-[10px] font-medium ${getCategoryColor(listing.category)}`}>{listing.category}</Badge>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {listing.views}</span>
                  <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {listing.saves}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Card WITHOUT image — text-only layout */
          <div className="bg-card rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-smooth p-4">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <Badge variant="secondary" className={`text-[10px] font-medium shrink-0 ${getCategoryColor(listing.category)}`}>{listing.category}</Badge>
              <div className="flex items-center gap-2 text-muted-foreground shrink-0">
                <Heart className="w-4 h-4" />
              </div>
            </div>
            <h3 className="font-bold text-sm leading-snug text-foreground group-hover:text-primary transition-colors mb-1.5 line-clamp-2">
              {listing.title}
            </h3>
            {price && (
              <p className="text-primary font-bold text-sm mb-2">{price}</p>
            )}
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-2">
              {listing.location_city && (
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{listing.location_city}{listing.location_state ? `, ${listing.location_state}` : ""}</span>
              )}
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(listing.created_date)}</span>
            </div>
            {listing.description && (
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{listing.description}</p>
            )}
          </div>
        )}
      </Link>
    </motion.div>
  );
}