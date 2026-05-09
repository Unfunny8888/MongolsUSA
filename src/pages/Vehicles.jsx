import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Car, MapPin, Gauge, Heart, Fuel } from "lucide-react";
import { MOCK_LISTINGS } from "../lib/mockData";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import {
  DiscoveryBar, SubTabs, SectionLabel,
  EmptyState, ImageCard, MapDiscovery,
} from "../components/shared/CategoryPageLayout";

const SUGGESTIONS = ["Nearby", "Under $5k", "Under $10k", "Under $20k", "Trucks", "SUVs", "Recently Posted"];
const TABS = [["buy", "Buy"], ["sell", "Sell"], ["rent", "Rent"]];

function VehicleCard({ listing, index }) {
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
        imageFallback={<Car className="w-10 h-10 text-orange-300" />}
        priceOverlay={listing.price ? `$${listing.price.toLocaleString()}` : null}
        topRight={
          <button onClick={e => { e.stopPropagation(); setSaved(s => !s); }}
            className="w-8 h-8 bg-white/90 dark:bg-card/90 rounded-full flex items-center justify-center shadow-sm">
            <Heart className={`w-4 h-4 ${saved ? "fill-rose-500 text-rose-500" : "text-muted-foreground"}`} />
          </button>
        }
        title={listing.title}
        meta={
          <>
            {listing.car_year && <span>{listing.car_year}</span>}
            {listing.car_mileage && (
              <span className="flex items-center gap-0.5">
                <Gauge className="w-3 h-3" />{listing.car_mileage.toLocaleString()} mi
              </span>
            )}
            {listing.car_fuel && (
              <span className="flex items-center gap-0.5">
                <Fuel className="w-3 h-3" />{listing.car_fuel}
              </span>
            )}
            {listing.location_city && (
              <span className="flex items-center gap-0.5 ml-auto">
                <MapPin className="w-2.5 h-2.5" />{listing.location_city}
              </span>
            )}
          </>
        }
        onClick={() => navigate(`/listing/${listing.id}`)}
      />
    </motion.div>
  );
}

export default function Vehicles() {
  const navigate = useNavigate();
  const [activeSug, setActiveSug] = useState("Nearby");
  const [activeTab, setActiveTab] = useState("buy");
  const [viewMode, setViewMode] = useState("list");
  const [listings, setListings] = useState(MOCK_LISTINGS.filter(l => l.category === "cars"));
  const [city, setCity] = useState(null);

  useEffect(() => {
    base44.entities.Listing.filter({ category: "cars", status: "active" }, "-created_date", 50)
      .then(data => { if (data?.length) setListings(data); })
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    let result = city ? listings.filter(l => l.location_city === city) : listings;
    if (activeSug === "Under $5k") return result.filter(l => l.price && l.price <= 5000);
    if (activeSug === "Under $10k") return result.filter(l => l.price && l.price <= 10000);
    if (activeSug === "Under $20k") return result.filter(l => l.price && l.price <= 20000);
    return result;
  }, [listings, activeSug, city]);

  return (
    <div className="min-h-dvh">
      <DiscoveryBar
        city={city}
        onCityChange={setCity}
        suggestions={SUGGESTIONS}
        activeSug={activeSug}
        onSuggest={setActiveSug}
        viewMode={viewMode}
        onToggleView={() => setViewMode("map")}
      />
      <SubTabs tabs={TABS} active={activeTab} onSelect={setActiveTab} />

      {viewMode === "map" ? (
        <MapDiscovery listings={filtered} onSelect={l => navigate(`/listing/${l.id}`)} onBackToList={() => setViewMode("list")} />
      ) : (
        <div className="px-4 py-4">
          {activeTab === "buy" && (
            <>
              <SectionLabel>Vehicles near you</SectionLabel>
              {filtered.length > 0 ? (
                <div className="space-y-3">
                  {filtered.map((l, i) => <VehicleCard key={l.id} listing={l} index={i} />)}
                </div>
              ) : (
                <EmptyState emoji="🚗" title="No vehicles found" subtitle="Try adjusting your filters" />
              )}
            </>
          )}
          {activeTab === "sell" && (
            <EmptyState emoji="🏷️" title="List your vehicle" subtitle="Post a listing to sell your car" />
          )}
          {activeTab === "rent" && (
            <EmptyState emoji="🔑" title="No rentals nearby" subtitle="Car rentals coming soon" />
          )}
        </div>
      )}
    </div>
  );
}