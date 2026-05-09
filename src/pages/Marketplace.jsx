import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, MapPin, Heart } from "lucide-react";
import { MOCK_LISTINGS } from "../lib/mockData";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import {
  DiscoveryBar, SubTabs, SectionLabel, EmptyState,
} from "../components/shared/CategoryPageLayout";

const FILTERS = ["All", "Electronics", "Furniture", "Clothing", "Books", "Free", "Under $50"];
const TABS = [["buy", "Buy"], ["sell", "Sell"], ["free", "Free Items"]];

function ItemCard({ listing, index }) {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const img = listing.images?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => navigate(`/listing/${listing.id}`)}
      className="flex gap-3 bg-card border border-border/15 rounded-2xl p-3 cursor-pointer active:scale-[0.98] transition-all duration-150 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
    >
      {img ? (
        <img src={img} alt={listing.title} className="w-16 h-16 rounded-xl object-cover shrink-0" loading="lazy" />
      ) : (
        <div className="w-16 h-16 rounded-xl bg-secondary/30 flex items-center justify-center shrink-0">
          <ShoppingBag className="w-6 h-6 text-muted-foreground/30" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-foreground line-clamp-1">{listing.title}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{listing.description}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[13px] font-bold text-primary">
            {listing.price_type === "free" ? "Free" : listing.price ? `$${listing.price.toLocaleString()}` : ""}
          </span>
          {listing.location_city && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 ml-auto">
              <MapPin className="w-2.5 h-2.5" />{listing.location_city}
            </span>
          )}
        </div>
      </div>
      <button onClick={e => { e.stopPropagation(); setSaved(s => !s); }} className="shrink-0 self-start pt-0.5">
        <Heart className={`w-4 h-4 ${saved ? "fill-rose-500 text-rose-500" : "text-muted-foreground"}`} />
      </button>
    </motion.div>
  );
}

export default function Marketplace() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("buy");
  const [listings, setListings] = useState(MOCK_LISTINGS.filter(l => ["electronics", "community"].includes(l.category)));
  const [city, setCity] = useState("Chicago, IL");

  useEffect(() => {
    base44.entities.Listing.filter({ status: "active" }, "-created_date", 80)
      .then(data => {
        const items = data?.filter(l => !["jobs", "housing", "services", "events", "cars"].includes(l.category));
        if (items?.length) setListings(items);
      })
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    let result = listings;
    if (activeTab === "free") return result.filter(l => l.price_type === "free" || l.price === 0);
    if (activeFilter === "Free") return result.filter(l => l.price_type === "free" || l.price === 0);
    if (activeFilter === "Under $50") return result.filter(l => l.price && l.price <= 50);
    if (activeFilter === "Electronics") return result.filter(l => l.category === "electronics");
    return result;
  }, [listings, activeFilter, activeTab]);

  return (
    <div className="min-h-dvh">
      <DiscoveryBar
        city={city}
        onCityClick={() => {}}
        filters={FILTERS}
        activeFilter={activeFilter}
        onFilter={setActiveFilter}
      />
      <SubTabs tabs={TABS} active={activeTab} onSelect={setActiveTab} />

      <div className="px-4 py-4">
        <SectionLabel>
          {activeTab === "free" ? "Free items near you" : "Items for sale"}
        </SectionLabel>
        {filtered.length > 0 ? (
          <div className="space-y-2.5">
            {filtered.map((l, i) => <ItemCard key={l.id} listing={l} index={i} />)}
          </div>
        ) : (
          <EmptyState emoji="🛍️" title="Nothing here yet" subtitle="Be the first to list something" />
        )}
      </div>
    </div>
  );
}