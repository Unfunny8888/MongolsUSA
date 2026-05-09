/**
 * Explore — intentional discovery + opportunity browsing.
 * Home = pulse. Explore = browse with purpose.
 */
import { useState, useEffect, useMemo, useRef, useCallback, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, Map, LayoutGrid, Loader2, ChevronDown,
         Briefcase, Home, Car, Wrench, CalendarDays, Store, Flame, Users, ShoppingBag } from "lucide-react";
import ListingCard from "../components/cards/ListingCard";
import { MOCK_LISTINGS, CATEGORIES, CITIES } from "../lib/mockData";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { useQueryCache } from "../hooks/useQueryCache";
import { base44 } from "@/api/base44Client";
const MapView = lazy(() => import("../components/explore/MapView"));

const BROWSE_CATS = [
  { id: "jobs",      label: "Jobs",      icon: Briefcase,    color: "text-blue-600",   bg: "bg-blue-50 dark:bg-blue-950/40"    },
  { id: "cars",      label: "Vehicles",  icon: Car,          color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/40"},
  { id: "housing",   label: "Housing",   icon: Home,         color: "text-rose-600",   bg: "bg-rose-50 dark:bg-rose-950/40"    },
  { id: "services",  label: "Services",  icon: Wrench,       color: "text-amber-600",  bg: "bg-amber-50 dark:bg-amber-950/40"  },
  { id: "events",    label: "Events",    icon: CalendarDays, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950/40"},
  { id: "electronics",label:"Electronics",icon: ShoppingBag, color: "text-sky-600",    bg: "bg-sky-50 dark:bg-sky-950/40"      },
  { id: "community", label: "Community", icon: Users,        color: "text-emerald-600",bg: "bg-emerald-50 dark:bg-emerald-950/40"},
];

function CategoryCard({ cat, onClick }) {
  const Icon = cat.icon;
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(cat.id)}
      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-border/20 ${cat.bg} active:opacity-80 transition-all`}
    >
      <Icon className={`w-6 h-6 ${cat.color}`} strokeWidth={1.8} />
      <span className={`text-[11px] font-bold ${cat.color}`}>{cat.label}</span>
    </motion.button>
  );
}

export default function Explore() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const initCat = urlParams.get("category") || "";

  const [category, setCategory] = useState(initCat);
  const [city, setCity] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [allListings, setAllListings] = useState(MOCK_LISTINGS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCityDrawer, setShowCityDrawer] = useState(false);
  const cache = useQueryCache();

  useEffect(() => {
    const cacheKey = "explore_listings";
    const cached = cache.get(cacheKey);
    if (cached) { setAllListings(cached); return; }
    base44.entities.Listing.filter({ status: "active" }, "-created_date", 200).then(data => {
      if (data && data.length > 0) { setAllListings(data); cache.set(cacheKey, data); }
    });
  }, []);

  const filtered = useMemo(() => allListings.filter((l) => {
    if (category && l.category !== category) return false;
    if (city && l.location_city !== city) return false;
    if (priceMin && l.price < Number(priceMin)) return false;
    if (priceMax && l.price > Number(priceMax)) return false;
    if (dateFilter) {
      const diff = Date.now() - new Date(l.created_date).getTime();
      if (dateFilter === "today" && diff > 86400000) return false;
      if (dateFilter === "week" && diff > 604800000) return false;
      if (dateFilter === "month" && diff > 2592000000) return false;
    }
    return true;
  }), [allListings, category, city, priceMin, priceMax, dateFilter]);

  const { visible, sentinelRef, hasMore } = useInfiniteScroll(filtered, 15);
  const activeFilters = [category, city, priceMin || priceMax, dateFilter].filter(Boolean).length;

  const browsing = !!category;
  const catLabel = BROWSE_CATS.find(c => c.id === category)?.label || CATEGORIES.find(c => c.id === category)?.label || category;

  return (
    <div className="min-h-dvh">
      {/* ── STICKY HEADER ── */}
      <div className="glass sticky top-0 z-40 border-b border-border/30">
        <div className="px-4 py-3 flex items-center gap-3">
          {browsing ? (
            <button onClick={() => setCategory("")} className="p-1">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          ) : (
            <div className="w-6" />
          )}
          <h1 className="text-base font-bold flex-1 truncate">
            {browsing ? catLabel : "Explore"}
          </h1>
          {browsing && (
            <button
              onClick={() => setViewMode(v => v === "grid" ? "map" : "grid")}
              className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-smooth"
            >
              {viewMode === "grid" ? <Map className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
            </button>
          )}
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

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-border/30"
            >
              <div className="px-4 py-3 space-y-3">
                <button
                  onClick={() => setShowCityDrawer(true)}
                  className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm text-left flex items-center justify-between"
                >
                  <span className={city ? "text-foreground font-medium" : "text-muted-foreground text-sm"}>
                    {city || "📍 Any city"}
                  </span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
                <div className="flex items-center gap-2">
                  <input type="number" placeholder="Min $" value={priceMin} onChange={e => setPriceMin(e.target.value)}
                    className="flex-1 bg-secondary/70 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/30" />
                  <span className="text-muted-foreground text-xs">–</span>
                  <input type="number" placeholder="Max $" value={priceMax} onChange={e => setPriceMax(e.target.value)}
                    className="flex-1 bg-secondary/70 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {[["today","Last 24h"],["week","This Week"],["month","This Month"]].map(([val, label]) => (
                    <button key={val} onClick={() => setDateFilter(dateFilter === val ? "" : val)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-smooth ${dateFilter === val ? "bg-primary text-white" : "bg-secondary text-foreground"}`}>
                      {label}
                    </button>
                  ))}
                </div>
                {activeFilters > 0 && (
                  <button onClick={() => { setCategory(""); setCity(""); setPriceMin(""); setPriceMax(""); setDateFilter(""); }}
                    className="text-xs font-semibold text-destructive flex items-center gap-1">
                    <X className="w-3 h-3" /> Clear all filters
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── DISCOVERY LANDING (no category selected) ── */}
      {!browsing && (
        <div className="px-4 pt-4 pb-8 space-y-6">
          {/* Browse by category */}
          <div>
            <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-3">Browse by Category</p>
            <div className="grid grid-cols-4 gap-2">
              {BROWSE_CATS.map(cat => (
                <CategoryCard key={cat.id} cat={cat} onClick={setCategory} />
              ))}
            </div>
          </div>

          {/* Trending now */}
          <div>
            <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest flex items-center gap-1.5 mb-3">
              <Flame className="w-3 h-3" /> Trending Now
            </p>
            <div className="space-y-3">
              {allListings
                .sort((a, b) => ((b.views || 0) + (b.saves || 0) * 3) - ((a.views || 0) + (a.saves || 0) * 3))
                .slice(0, 4)
                .map((l, i) => <ListingCard key={l.id} listing={l} index={i} />)}
            </div>
          </div>

          {/* Local businesses */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest flex items-center gap-1.5">
                <Store className="w-3 h-3" /> Local Businesses
              </p>
              <button onClick={() => navigate("/businesses")} className="text-[11px] font-semibold text-primary">See all</button>
            </div>
            <div className="space-y-2">
              {allListings.filter(l => l.category === "services").slice(0, 3).map((l, i) => (
                <ListingCard key={l.id} listing={l} index={i} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── CATEGORY RESULTS ── */}
      {browsing && (
        <div className="px-4 py-4">
          <p className="text-xs text-muted-foreground mb-4">{filtered.length} listings</p>
          {viewMode === "map" ? (
            <Suspense fallback={<div className="h-[60vh] bg-secondary/50 rounded-2xl flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>}>
              <MapView listings={filtered} />
            </Suspense>
          ) : (
            <div className="space-y-3">
              {visible.map((l, i) => <ListingCard key={l.id} listing={l} index={i} />)}
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
      )}

      {/* City Drawer */}
      {showCityDrawer && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={() => setShowCityDrawer(false)}
          className="fixed inset-0 z-50 bg-black/40 flex items-end">
          <motion.div initial={{ y: 400 }} animate={{ y: 0 }} exit={{ y: 400 }}
            onClick={e => e.stopPropagation()}
            className="w-full bg-card rounded-t-3xl p-4 max-h-[60vh] overflow-y-auto">
            <h3 className="text-sm font-bold mb-3">Select City</h3>
            <div className="space-y-1">
              <button onClick={() => { setCity(""); setShowCityDrawer(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl transition-smooth ${!city ? "bg-primary text-white font-semibold" : "bg-secondary/30"}`}>
                All Cities
              </button>
              {CITIES.map(c => (
                <button key={c.name} onClick={() => { setCity(c.name); setShowCityDrawer(false); }}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-smooth ${city === c.name ? "bg-primary text-white font-semibold" : "bg-secondary/30"}`}>
                  {c.name}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}