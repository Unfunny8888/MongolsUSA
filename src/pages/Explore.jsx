import { useState, useEffect, lazy, Suspense } from "react";
import { ArrowLeft, SlidersHorizontal, X, Map, LayoutGrid } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ListingCard from "../components/cards/ListingCard";
import CategoryChip from "../components/cards/CategoryChip";
import { MOCK_LISTINGS, CATEGORIES, CITIES } from "../lib/mockData";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { useQueryCache } from "../hooks/useQueryCache";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
const MapView = lazy(() => import("../components/explore/MapView"));

export default function Explore() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const initCat = urlParams.get("category") || "";
  const initFeatured = urlParams.get("featured") === "true";

  const [category, setCategory] = useState(initCat);
  const [city, setCity] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [dateFilter, setDateFilter] = useState(""); // today | week | month
  const [viewMode, setViewMode] = useState("grid"); // grid | map
  const [allListings, setAllListings] = useState(MOCK_LISTINGS);
  const cache = useQueryCache();

  useEffect(() => {
    const cacheKey = "explore_listings";
    const cached = cache.get(cacheKey);
    if (cached) { setAllListings(cached); return; }
    base44.entities.Listing.filter({ status: "active" }, "-created_date", 200).then(data => {
      if (data && data.length > 0) { setAllListings(data); cache.set(cacheKey, data); }
    });
  }, []);

  const filtered = allListings.filter((l) => {
    if (category && l.category !== category) return false;
    if (city && l.location_city !== city) return false;
    if (initFeatured && !l.is_featured) return false;
    if (priceMin && l.price < Number(priceMin)) return false;
    if (priceMax && l.price > Number(priceMax)) return false;
    if (dateFilter) {
      const now = Date.now();
      const created = new Date(l.created_date).getTime();
      const diff = now - created;
      if (dateFilter === "today" && diff > 86400000) return false;
      if (dateFilter === "week" && diff > 604800000) return false;
      if (dateFilter === "month" && diff > 2592000000) return false;
    }
    return true;
  });

  const { visible, sentinelRef, hasMore } = useInfiniteScroll(filtered, 15);
  const activeFilters = [category, city, priceMin || priceMax, dateFilter].filter(Boolean).length;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="glass sticky top-0 z-40 border-b border-border/30">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold flex-1">
            {initFeatured ? "Featured Listings" : category ? CATEGORIES.find(c => c.id === category)?.label || "Explore" : "Explore"}
          </h1>
          <button
            onClick={() => setViewMode(v => v === "grid" ? "map" : "grid")}
            className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-smooth"
          >
            {viewMode === "grid" ? <Map className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="relative p-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-smooth"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {activeFilters > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">
                {activeFilters}
              </div>
            )}
          </button>
        </div>

        {/* Category Chips */}
        <div className="px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setCategory("")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-smooth ${
                !category ? "bg-primary text-white" : "bg-secondary text-foreground"
              }`}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(category === cat.id ? "" : cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-smooth ${
                  category === cat.id ? "bg-primary text-white" : "bg-secondary text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-border/30"
            >
              <div className="px-4 py-3">
                <p className="text-xs font-semibold mb-2 text-muted-foreground">City</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {CITIES.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setCity(city === c.name ? "" : c.name)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-smooth ${
                        city === c.name ? "bg-primary text-white" : "bg-secondary text-foreground"
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>

                <p className="text-xs font-semibold mb-2 text-muted-foreground">Price Range</p>
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="number"
                    placeholder="Min $"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="flex-1 bg-secondary/70 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <span className="text-muted-foreground text-xs">–</span>
                  <input
                    type="number"
                    placeholder="Max $"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="flex-1 bg-secondary/70 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <p className="text-xs font-semibold mb-2 text-muted-foreground">Date Posted</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {[["today", "Last 24h"], ["week", "This Week"], ["month", "This Month"]].map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => setDateFilter(dateFilter === val ? "" : val)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-smooth ${
                        dateFilter === val ? "bg-primary text-white" : "bg-secondary text-foreground"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {(category || city || priceMin || priceMax || dateFilter) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setCategory(""); setCity(""); setPriceMin(""); setPriceMax(""); setDateFilter(""); }}
                    className="mt-3 text-xs text-destructive"
                  >
                    <X className="w-3 h-3 mr-1" /> Clear filters
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results */}
      <div className="px-4 py-4">
        <p className="text-xs text-muted-foreground mb-4">{filtered.length} listings</p>
        {viewMode === "map" ? (
          <Suspense fallback={<div className="h-[60vh] bg-secondary/50 rounded-2xl flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>}>
            <MapView listings={filtered} />
          </Suspense>
        ) : (
          <div className="space-y-3">
            {visible.map((l, i) => (
              <ListingCard key={l.id} listing={l} index={i} />
            ))}
            {hasMore && (
              <div ref={sentinelRef} className="flex justify-center py-6">
                <div className="w-6 h-6 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
            )}
          </div>
        )}
        {filtered.length === 0 && viewMode === "grid" && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-sm font-medium text-foreground">No listings found</p>
            <p className="text-xs text-muted-foreground mt-1">Try changing your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}