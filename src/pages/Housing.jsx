/**
 * Housing — rentals, roommates, housing help.
 */
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Home, Heart, SlidersHorizontal, BedDouble, Bath } from "lucide-react";
import { MOCK_LISTINGS } from "../lib/mockData";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";

const HOUSING_FILTERS = ["All", "Apartments", "Roommates", "Short-term", "Houses"];

function HousingCard({ listing, index }) {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const img = listing.images?.[0];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-card border border-border/20 rounded-2xl overflow-hidden active:scale-[0.99] cursor-pointer"
      onClick={() => navigate(`/listing/${listing.id}`)}
    >
      <div className="relative">
        {img ? (
          <img src={img} alt={listing.title} className="w-full h-44 object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-44 bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center">
            <Home className="w-10 h-10 text-rose-400" />
          </div>
        )}
        <button
          onClick={e => { e.stopPropagation(); setSaved(s => !s); }}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 dark:bg-card/90 rounded-full flex items-center justify-center shadow-sm"
        >
          <Heart className={`w-4 h-4 ${saved ? "fill-rose-500 text-rose-500" : "text-muted-foreground"}`} />
        </button>
        {listing.price && (
          <div className="absolute bottom-3 left-3 bg-foreground/80 backdrop-blur text-background text-[13px] font-bold px-2.5 py-1 rounded-xl">
            ${listing.price.toLocaleString()}<span className="text-[10px] font-medium opacity-80">/mo</span>
          </div>
        )}
      </div>
      <div className="px-3 py-3">
        <p className="text-[13.5px] font-bold text-foreground leading-snug line-clamp-1">{listing.title}</p>
        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
          {listing.housing_bedrooms != null && (
            <span className="flex items-center gap-0.5"><BedDouble className="w-3 h-3" />{listing.housing_bedrooms} bed</span>
          )}
          {listing.housing_bathrooms != null && (
            <span className="flex items-center gap-0.5"><Bath className="w-3 h-3" />{listing.housing_bathrooms} bath</span>
          )}
          {listing.location_city && (
            <span className="flex items-center gap-0.5 ml-auto"><MapPin className="w-2.5 h-2.5" />{listing.location_city}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Compact roommate card
function RoommateCard({ listing, index }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => navigate(`/listing/${listing.id}`)}
      className="flex gap-3 bg-card border border-border/20 rounded-2xl p-3 cursor-pointer"
    >
      <img src={listing.poster_avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80"}
        alt={listing.poster_name} className="w-12 h-12 rounded-full object-cover shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-foreground">{listing.poster_name}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{listing.description}</p>
        <div className="flex items-center gap-2 mt-1">
          {listing.location_city && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{listing.location_city}</span>}
          {listing.price && <span className="text-[11px] font-bold text-primary ml-auto">${listing.price}/mo</span>}
        </div>
      </div>
    </motion.div>
  );
}

export default function Housing() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("rentals");
  const [listings, setListings] = useState(MOCK_LISTINGS.filter(l => l.category === "housing"));
  const [location, setLocation] = useState("Chicago, IL");

  useEffect(() => {
    base44.entities.Listing.filter({ category: "housing", status: "active" }, "-created_date", 50)
      .then(data => { if (data?.length) setListings(data); });
  }, []);

  const filtered = useMemo(() => {
    if (activeFilter === "All") return listings;
    const map = { Apartments: "apartment", Houses: "house", Roommates: "room", "Short-term": "studio" };
    const type = map[activeFilter];
    return listings.filter(l => l.housing_type === type || l.tags?.includes(activeFilter.toLowerCase()));
  }, [listings, activeFilter]);

  const roommates = listings.filter(l => l.housing_type === "room" || l.tags?.includes("roommate") || l.description?.toLowerCase().includes("roommate") || l.description?.toLowerCase().includes("нөхөр"));

  return (
    <div className="min-h-dvh">
      {/* Location */}
      <div className="px-4 py-2.5 border-b border-border/15">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground font-medium">Location</p>
            <p className="text-[13px] font-bold text-foreground">{location}</p>
          </div>
          <button className="text-[12px] font-semibold text-primary">Change</button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 py-2.5 border-b border-border/10">
        {HOUSING_FILTERS.map(f => (
          <button key={f} onClick={() => setActiveFilter(f)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-colors ${
              activeFilter === f ? "bg-foreground text-background" : "bg-secondary/60 text-muted-foreground"
            }`}>
            {f}
          </button>
        ))}
        <button className="shrink-0 w-8 h-8 rounded-full bg-secondary/60 flex items-center justify-center">
          <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="flex border-b border-border/20 px-4">
        {[["rentals", "Rentals"], ["roommates", "Roommates"], ["help", "Housing Help"]].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`py-3 mr-5 text-[13px] font-semibold border-b-2 transition-colors ${
              activeTab === id ? "border-primary text-primary" : "border-transparent text-muted-foreground"
            }`}>
            {label}
          </button>
        ))}
      </div>

      <div className="px-4 py-4">
        {activeTab === "rentals" && (
          <>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Recommended rentals</p>
            <div className="space-y-3">
              {filtered.map((l, i) => <HousingCard key={l.id} listing={l} index={i} />)}
            </div>
          </>
        )}
        {activeTab === "roommates" && (
          <>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Looking for roommates</p>
            <div className="space-y-2.5">
              {roommates.map((l, i) => <RoommateCard key={l.id} listing={l} index={i} />)}
            </div>
          </>
        )}
        {activeTab === "help" && (
          <div className="text-center py-16">
            <p className="text-3xl mb-2">🏠</p>
            <p className="text-sm font-medium">Housing assistance coming soon</p>
            <p className="text-xs text-muted-foreground mt-1">Find emergency housing, shelters, and community support</p>
          </div>
        )}
      </div>
    </div>
  );
}