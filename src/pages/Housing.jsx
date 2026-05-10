import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Home, Heart, BedDouble, Bath } from "lucide-react";
import { MOCK_LISTINGS } from "../lib/mockData";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { SubTabs, SectionLabel, EmptyState, ImageCard } from "../components/shared/CategoryPageLayout";
import GlobalDiscoveryBar from "../components/discovery/GlobalDiscoveryBar";
import GlobalMapDiscovery from "../components/maps/GlobalMapDiscovery";
import { useDiscovery } from "@/lib/DiscoveryContext";

const SUGGESTIONS = ["Nearby", "Apartments", "Houses", "Rooms", "Short-term", "Furnished", "Popular"];
const TABS = [["rentals", "Rentals"], ["roommates", "Roommates"], ["help", "Housing Help"]];

function HousingCard({ listing, index }) {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <ImageCard
        imageSrc={listing.images?.[0]}
        imageAlt={listing.title}
        imageFallback={<Home className="w-10 h-10 text-rose-300" />}
        priceOverlay={listing.price ? `$${listing.price.toLocaleString()}/mo` : null}
        topRight={
          <button onClick={e => { e.stopPropagation(); setSaved(s => !s); }}
            className="w-8 h-8 bg-white/90 dark:bg-card/90 rounded-full flex items-center justify-center shadow-sm">
            <Heart className={`w-4 h-4 ${saved ? "fill-rose-500 text-rose-500" : "text-muted-foreground"}`} />
          </button>
        }
        title={listing.title}
        meta={
          <>
            {listing.housing_bedrooms != null && (
              <span className="flex items-center gap-0.5"><BedDouble className="w-3 h-3" />{listing.housing_bedrooms} bed</span>
            )}
            {listing.housing_bathrooms != null && (
              <span className="flex items-center gap-0.5"><Bath className="w-3 h-3" />{listing.housing_bathrooms} bath</span>
            )}
            {listing.location_city && (
              <span className="flex items-center gap-0.5 ml-auto"><MapPin className="w-2.5 h-2.5" />{listing.location_city}</span>
            )}
          </>
        }
        onClick={() => navigate(`/listing/${listing.id}`)}
      />
    </motion.div>
  );
}

function RoommateCard({ listing, index }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => navigate(`/listing/${listing.id}`)}
      className="flex gap-3 bg-card border border-border/15 rounded-2xl p-3 cursor-pointer active:scale-[0.98] transition-all duration-150 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
    >
      <img
        src={listing.poster_avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80"}
        alt={listing.poster_name}
        className="w-12 h-12 rounded-full object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-foreground">{listing.poster_name}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{listing.description}</p>
        <div className="flex items-center gap-2 mt-1">
          {listing.location_city && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              <MapPin className="w-2.5 h-2.5" />{listing.location_city}
            </span>
          )}
          {listing.price && (
            <span className="text-[13px] font-bold text-primary ml-auto">${listing.price}/mo</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Housing() {
  const navigate = useNavigate();
  const { city, getFilter, setFilter, getViewMode, setViewMode } = useDiscovery();
  const activeSug = getFilter('housing');
  const viewMode = getViewMode('housing');
  const [activeTab, setActiveTab] = useState("rentals");
  const [listings, setListings] = useState(MOCK_LISTINGS.filter(l => l.category === "housing"));

  useEffect(() => {
    base44.entities.Listing.filter({ category: "housing", status: "active" }, "-created_date", 50)
      .then(data => { if (data?.length) setListings(data); })
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    let result = city ? listings.filter(l => l.location_city === city) : listings;
    const map = { Apartments: "apartment", Houses: "house", Rooms: "room", "Short-term": "studio" };
    const type = map[activeSug];
    if (type) return result.filter(l => l.housing_type === type);
    if (activeSug === "Furnished") return result.filter(l => l.housing_furnished);
    return result;
  }, [listings, activeSug, city]);

  const roommates = listings.filter(l =>
    l.housing_type === "room" ||
    l.tags?.includes("roommate") ||
    l.description?.toLowerCase().includes("roommate")
  );

  return (
    <div className="min-h-dvh">
      <GlobalDiscoveryBar
        suggestions={SUGGESTIONS}
        activeSug={activeSug}
        onSuggest={s => setFilter('housing', s)}
        showMapToggle={viewMode === "list"}
        onMapToggle={() => setViewMode('housing', 'map')}
      />
      <SubTabs tabs={TABS} active={activeTab} onSelect={setActiveTab} />

      {viewMode === "map" ? (
        <GlobalMapDiscovery
          listings={filtered}
          onSelect={l => navigate(`/listing/${l.id}`)}
          onBackToList={() => setViewMode('housing', 'list')}
        />
      ) : (
        <div className="px-4 py-4">
          {activeTab === "rentals" && (
            <>
              <SectionLabel>Rentals near you</SectionLabel>
              {filtered.length > 0 ? (
                <div className="space-y-3">
                  {filtered.map((l, i) => <HousingCard key={l.id} listing={l} index={i} />)}
                </div>
              ) : (
                <EmptyState emoji="🏠" title="No rentals found" subtitle="Try adjusting your filters" />
              )}
            </>
          )}
          {activeTab === "roommates" && (
            <>
              <SectionLabel>Looking for roommates</SectionLabel>
              {roommates.length > 0 ? (
                <div className="space-y-2.5">
                  {roommates.map((l, i) => <RoommateCard key={l.id} listing={l} index={i} />)}
                </div>
              ) : (
                <EmptyState emoji="🤝" title="No roommate listings" subtitle="Post a listing to find a roommate" />
              )}
            </>
          )}
          {activeTab === "help" && (
            <EmptyState emoji="🏡" title="Housing assistance" subtitle="Emergency housing and community support — coming soon" />
          )}
        </div>
      )}
    </div>
  );
}