import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Star, Wrench, Heart, CheckCircle2 } from "lucide-react";
import { MOCK_LISTINGS, MOCK_BUSINESSES } from "../lib/mockData";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import {
  SubTabs, SectionLabel, EmptyState, MapDiscovery,
} from "../components/shared/CategoryPageLayout";
import GlobalDiscoveryBar from "../components/shared/GlobalDiscoveryBar";
import { useDiscovery } from "@/lib/DiscoveryContext";

const SUGGESTIONS = ["Nearby", "Top Rated", "Open Now", "Home", "Auto", "Legal", "Cleaning", "Tax", "Beauty"];
const TABS = [["businesses", "Businesses"], ["freelancers", "Freelancers"], ["recommended", "Recommended"]];

function BusinessRow({ business, index }) {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => navigate(`/business/${business.id}`)}
      className="flex items-center gap-3 bg-card border border-border/15 rounded-2xl px-3 py-3 cursor-pointer active:scale-[0.98] transition-all duration-150 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
    >
      {business.logo ? (
        <img src={business.logo} alt={business.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
      ) : (
        <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center shrink-0">
          <Wrench className="w-5 h-5 text-amber-500" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-[13px] font-bold text-foreground leading-snug truncate">{business.name}</p>
          {business.is_verified && <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />}
        </div>
        <p className="text-[11px] text-muted-foreground capitalize">{business.category?.replace("_", " ")}</p>
        <div className="flex items-center gap-2 mt-1">
          {business.rating && (
            <span className="flex items-center gap-0.5 text-[11px] font-semibold text-amber-600">
              <Star className="w-3 h-3 fill-amber-400" />{business.rating}
              <span className="text-muted-foreground font-normal">({business.review_count})</span>
            </span>
          )}
          {business.city && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <MapPin className="w-2.5 h-2.5" />{business.city}
            </span>
          )}
        </div>
      </div>
      <button onClick={e => { e.stopPropagation(); setSaved(s => !s); }}
        className="shrink-0 text-muted-foreground">
        <Heart className={`w-4 h-4 ${saved ? "fill-rose-500 text-rose-500" : ""}`} />
      </button>
    </motion.div>
  );
}

function FreelancerCard({ listing, index }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => navigate(`/listing/${listing.id}`)}
      className="flex items-center gap-3 bg-card border border-border/15 rounded-2xl px-3 py-3 cursor-pointer active:scale-[0.98] transition-all duration-150 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
    >
      <img
        src={listing.poster_avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80"}
        alt={listing.poster_name}
        className="w-12 h-12 rounded-full object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-foreground">{listing.poster_name}</p>
        <p className="text-[11px] text-muted-foreground capitalize line-clamp-1">{listing.title}</p>
        <div className="flex items-center gap-2 mt-1">
          {listing.location_city && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              <MapPin className="w-2.5 h-2.5" />{listing.location_city}
            </span>
          )}
          {listing.rating && (
            <span className="text-[10px] font-semibold text-amber-600 flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 fill-amber-400" />{listing.rating}
            </span>
          )}
          {listing.price && (
            <span className="text-[13px] font-bold text-primary ml-auto">
              ${listing.price}{listing.price_type === "hourly" ? "/hr" : ""}
            </span>
          )}
        </div>
      </div>
      <button className="shrink-0 bg-primary text-primary-foreground text-[11px] font-bold px-3 py-1.5 rounded-full">
        View
      </button>
    </motion.div>
  );
}

export default function ServicesPage() {
  const navigate = useNavigate();
  const { city } = useDiscovery();
  const [activeSug, setActiveSug] = useState("Nearby");
  const [activeTab, setActiveTab] = useState("businesses");
  const [viewMode, setViewMode] = useState("list");
  const [listings, setListings] = useState(MOCK_LISTINGS.filter(l => l.category === "services"));
  const [businesses, setBusinesses] = useState(MOCK_BUSINESSES);

  useEffect(() => {
    base44.entities.Business.list("-rating", 20)
      .then(data => { if (data?.length) setBusinesses(data); })
      .catch(() => {});
    base44.entities.Listing.filter({ category: "services", status: "active" }, "-created_date", 30)
      .then(data => { if (data?.length) setListings(data); })
      .catch(() => {});
  }, []);

  const filteredBiz = useMemo(() => {
    let result = city ? businesses.filter(b => b.city === city) : businesses;
    if (!activeSug || ["Nearby", "Top Rated", "Open Now"].includes(activeSug)) return result;
    return result.filter(b =>
      b.category?.toLowerCase().includes(activeSug.toLowerCase()) ||
      b.tags?.some(t => t.toLowerCase().includes(activeSug.toLowerCase()))
    );
  }, [businesses, activeSug, city]);

  // For map: combine businesses + listings
  const mapItems = useMemo(() =>
    [...filteredBiz.map(b => ({ id: b.id, title: b.name, price: null, location_city: b.city, images: b.logo ? [b.logo] : [] })),
     ...listings],
    [filteredBiz, listings]
  );

  return (
    <div className="min-h-dvh">
      <GlobalDiscoveryBar
        suggestions={SUGGESTIONS}
        activeSug={activeSug}
        onSuggest={setActiveSug}
        showMapToggle={viewMode === "list"}
        onMapToggle={() => setViewMode("map")}
      />
      <SubTabs tabs={TABS} active={activeTab} onSelect={setActiveTab} />

      {viewMode === "map" ? (
        <MapDiscovery listings={mapItems} onBackToList={() => setViewMode("list")} onSelect={item => {
          if (filteredBiz.find(b => b.id === item.id)) navigate(`/business/${item.id}`);
          else navigate(`/listing/${item.id}`);
        }} />
      ) : (
        <div className="px-4 py-4">
          {activeTab === "businesses" && (
            <>
              <SectionLabel>Top rated services</SectionLabel>
              {filteredBiz.length > 0 ? (
                <div className="space-y-2.5">
                  {filteredBiz.map((b, i) => <BusinessRow key={b.id} business={b} index={i} />)}
                </div>
              ) : (
                <EmptyState emoji="🔧" title="No services found" subtitle="Try adjusting your filters" />
              )}
            </>
          )}
          {activeTab === "freelancers" && (
            <>
              <SectionLabel>Independent freelancers</SectionLabel>
              {listings.length > 0 ? (
                <div className="space-y-2.5">
                  {listings.map((l, i) => <FreelancerCard key={l.id} listing={l} index={i} />)}
                </div>
              ) : (
                <EmptyState emoji="👤" title="No freelancers yet" subtitle="Community members will appear here" />
              )}
            </>
          )}
          {activeTab === "recommended" && (
            <EmptyState emoji="⭐" title="Community recommendations" subtitle="Top picks from locals — coming soon" />
          )}
        </div>
      )}
    </div>
  );
}