import { useNavigate } from "react-router-dom";
import { Heart, Eye, MapPin, Clock, Star, Zap, Navigation } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useCallback } from "react";
import { useTapGesture } from "@/hooks/useTapGesture";

// Approximate coords for common US cities
const CITY_COORDS = {
  "Chicago": [41.8781, -87.6298], "New York": [40.7128, -74.006], "Los Angeles": [34.0522, -118.2437],
  "Houston": [29.7604, -95.3698], "Phoenix": [33.4484, -112.074], "Philadelphia": [39.9526, -75.1652],
  "San Antonio": [29.4241, -98.4936], "San Diego": [32.7157, -117.1611], "Dallas": [32.7767, -96.797],
  "San Jose": [37.3382, -121.8863], "Austin": [30.2672, -97.7431], "Jacksonville": [30.3322, -81.6557],
  "Denver": [39.7392, -104.9903], "Seattle": [47.6062, -122.3321], "Nashville": [36.1627, -86.7816],
  "Boston": [42.3601, -71.0589], "Las Vegas": [36.1699, -115.1398], "Minneapolis": [44.9778, -93.265],
  "Atlanta": [33.749, -84.388], "Portland": [45.5051, -122.675], "Miami": [25.7617, -80.1918],
  "Detroit": [42.3314, -83.0458], "Baltimore": [39.2904, -76.6122], "Louisville": [38.2527, -85.7585],
  "Milwaukee": [43.0389, -87.9065], "Albuquerque": [35.0844, -106.6504], "Tucson": [32.2217, -110.9265],
  "Sacramento": [38.5816, -121.4944], "Cleveland": [41.4993, -81.6944], "Columbus": [39.9612, -82.9988],
};

function haversineDistance([lat1, lon1], [lat2, lon2]) {
  const R = 3958.8; // miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// Cache user position at module level (IP-based)
let cachedPosition = null;
async function getUserPosition() {
  if (cachedPosition) return cachedPosition;
  try {
    const res = await fetch("https://ip-api.com/json/?fields=lat,lon");
    const data = await res.json();
    if (data.lat && data.lon) {
      cachedPosition = [data.lat, data.lon];
      return cachedPosition;
    }
  } catch {}
  return null;
}

function formatPrice(listing) {
  if (listing.price_type === "free") return { text: "Free", color: "text-emerald-600" };
  if (!listing.price) return null;
  const p = `$${listing.price.toLocaleString()}`;
  const suffixes = { hourly: "/цаг", monthly: "/сар", weekly: "/7 хоног", yearly: "/жил" };
  const suffix = suffixes[listing.price_type] || "";
  return { text: `${p}${suffix}`, color: "text-primary" };
}

function getCategoryColor(cat) {
  const colors = {
    cars: "bg-blue-100 text-blue-700", jobs: "bg-emerald-100 text-emerald-700",
    housing: "bg-orange-100 text-orange-700", services: "bg-purple-100 text-purple-700",
    events: "bg-pink-100 text-pink-700", electronics: "bg-cyan-100 text-cyan-700",
    community: "bg-amber-100 text-amber-700",
  };
  return colors[cat] || "bg-gray-100 text-gray-700";
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "Саяхан";
  if (mins < 60) return `${mins} мин`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} цаг`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Өчигдөр";
  if (days < 7) return `${days} өдөр`;
  const weeks = Math.floor(days / 7);
  return `${weeks} долоо хоног`;
}

function useDistance(city) {
  const [dist, setDist] = useState(null);
  useEffect(() => {
    const coords = CITY_COORDS[city];
    if (!coords) return;
    getUserPosition().then((pos) => {
      if (pos) setDist(haversineDistance(pos, coords));
    });
  }, [city]);
  return dist;
}

function MetaRow({ listing, dist }) {
  return (
    <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
      {listing.location_city && (
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {listing.location_city}{listing.location_state ? `, ${listing.location_state}` : ""}
        </span>
      )}
      {dist !== null && (
        <span className="flex items-center gap-1 text-primary/70">
          <Navigation className="w-3 h-3" />~{dist} mi
        </span>
      )}
      {listing.created_date && (
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />{timeAgo(listing.created_date)}
        </span>
      )}
    </div>
  );
}

export default function ListingCard({ listing, index = 0 }) {
  const navigate = useNavigate();
  const handleTap = useCallback(() => navigate(`/listing/${listing.id}`), [navigate, listing.id]);
  const { onTouchStart, onTouchMove, onTouchEnd } = useTapGesture(handleTap);
  const hasImage = listing.images?.length > 0;
  const price = formatPrice(listing);
  const dist = useDistance(listing.location_city);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="block group cursor-pointer">
        {hasImage ? (
          <div className="bg-card rounded-2xl overflow-hidden border border-border/40 shadow-md hover:shadow-lg transition-all duration-200"
            style={{ willChange: 'transform', transform: 'translateZ(0)' }}>
            {/* Image with skeleton */}
            <div className="relative w-full bg-secondary/50" style={{ aspectRatio: '16/10' }}>
              {!imageLoaded && <div className="absolute inset-0 bg-secondary/50 animate-pulse" />}
              <img
                src={listing.images[0]}
                alt={listing.title}
                onLoad={() => setImageLoaded(true)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              {/* Top badges */}
              <div className="absolute top-4 left-4 flex gap-2 z-10">
                {dist !== null && (
                  <Badge className="bg-white/95 backdrop-blur text-slate-900 border-0 shadow-md text-[10px] font-semibold gap-1">
                    <Navigation className="w-3 h-3" /> ~{dist} mi
                  </Badge>
                )}
                {listing.is_featured && (
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-md text-[10px] font-semibold gap-1">
                    <Star className="w-3 h-3" /> Featured
                  </Badge>
                )}
                {listing.is_boosted && (
                  <Badge className="bg-gradient-to-r from-primary to-emerald-600 text-white border-0 shadow-md text-[10px] font-semibold gap-1">
                    <Zap className="w-3 h-3" /> Boosted
                  </Badge>
                )}
              </div>
              {/* Price overlay */}
              {price && (
                <div className="absolute bottom-4 right-4">
                  <div className="glass rounded-xl px-3.5 py-2 font-bold text-sm text-foreground shadow-lg">
                    {price.text}
                  </div>
                </div>
              )}
            </div>
            {/* Content */}
            <div className="p-4 space-y-3">
              <h3 className="font-bold text-base leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                {listing.title}
              </h3>
              <MetaRow listing={listing} dist={dist} />
              <div className="flex items-center justify-between pt-2 border-t border-border/20">
                <Badge variant="secondary" className={`text-[10px] font-semibold px-2.5 py-1 ${getCategoryColor(listing.category)}`}>
                  {listing.category}
                </Badge>
                <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{listing.views || 0}</span>
                  <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{listing.saves || 0}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
            <div className="bg-card rounded-2xl border border-border/40 shadow-md hover:shadow-lg transition-all duration-200 p-4 space-y-3"
            style={{ willChange: 'transform', transform: 'translateZ(0)' }}>
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className={`text-[10px] font-semibold px-2.5 py-1 ${getCategoryColor(listing.category)}`}>
                {listing.category}
              </Badge>
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" />{timeAgo(listing.created_date)}
              </span>
            </div>
            <h3 className="font-bold text-base leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
              {listing.title}
            </h3>
            {price && (
              <p className={`font-bold text-lg ${price.color}`}>{price.text}</p>
            )}
            <MetaRow listing={listing} dist={dist} />
            {listing.description && (
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 border-t border-border/20 pt-3">
                {listing.description}
              </p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}