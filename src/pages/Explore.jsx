/**
 * Explore — intentional discovery + opportunity browsing.
 * Home = pulse. Explore = browse with purpose.
 */
import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, Map, LayoutGrid, ChevronDown, Star, MapPin,
         Briefcase, Home, Car, Wrench, CalendarDays, Store, Flame, Users, ShoppingBag } from "lucide-react";
import FeedItem from "../components/feed/FeedItem";
import ListingCard from "../components/cards/ListingCard";
import BusinessCard from "../components/cards/BusinessCard";
import { MOCK_LISTINGS, MOCK_BUSINESSES, CATEGORIES, CITIES } from "../lib/mockData";
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

// Compact category pill shortcut
function CategoryPill({ cat, onClick }) {
  const Icon = cat.icon;
  return (
    <button
      onClick={() => onClick(cat.id)}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/20 ${cat.bg} active:opacity-70 transition-all shrink-0`}
    >
      <Icon className={`w-3 h-3 ${cat.color}`} strokeWidth={2} />
      <span className={`text-[11px] font-semibold ${cat.color}`}>{cat.label}</span>
    </button>
  );
}

// Compact trending listing row
function TrendingRow({ listing, index }) {
  const navigate = useNavigate();
  const price = listing.price ? `$${listing.price.toLocaleString()}` : null;
  const CAT_COLOR = {
    jobs: "text-blue-600", events: "text-violet-600", services: "text-amber-600",
    housing: "text-rose-600", cars: "text-orange-600",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => navigate(`/listing/${listing.id}`)}
      className="flex items-center gap-3 py-2.5 border-b border-border/10 last:border-0 cursor-pointer active:opacity-70"
    >
      {listing.images?.[0] ? (
        <img src={listing.images[0]} alt={listing.title} className="w-11 h-11 rounded-xl object-cover shrink-0" loading="lazy" />
      ) : (
        <div className="w-11 h-11 rounded-xl bg-secondary/60 shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-foreground leading-snug line-clamp-1">{listing.title}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`text-[10px] font-semibold capitalize ${CAT_COLOR[listing.category] || "text-muted-foreground"}`}>{listing.category}</span>
          {listing.location_city && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <MapPin className="w-2.5 h-2.5" />{listing.location_city}
            </span>
          )}
        </div>
      </div>
      {price && <span className="text-[12px] font-bold text-primary shrink-0">{price}</span>}
    </motion.div>
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
  const [businesses, setBusinesses] = useState(MOCK_BUSINESSES);
  const [showCityDrawer, setShowCityDrawer] = useState(false);
  const cache = useQueryCache();

  useEffect(() => {
    const cacheKey = "explore_listings";
    const cached = cache.get(cacheKey);
    if (cached) { setAllListings(cached); return; }
    base44.entities.Listing.filter({ status: "active" }, "-created_date", 200).then(data => {
      if (data && data.length > 0) { setAllListings(data); cache.set(cacheKey, data); }
    });
    base44.entities.Business.list("-rating", 12).then(data => {
      if (data && data.length > 0) setBusinesses(data);
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
        <div className="pb-8">

          {/* 1. Featured Local Businesses */}
          <div className="pt-4 pb-2">
            <div className="flex items-center justify-between px-4 mb-2.5">
              <div className="flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-primary/70" />
                <span className="text-[11px] font-bold text-foreground/60 uppercase tracking-widest">Featured Businesses</span>
              </div>
              <button onClick={() => navigate("/businesses")} className="text-[11px] font-semibold text-primary">See all</button>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar px-4">
              {businesses.map((b, i) => (
                <div key={b.id} className="shrink-0 w-52">
                  <BusinessCard business={b} index={i} />
                </div>
              ))}
            </div>
          </div>

          {/* 2. Category shortcuts — compact pills */}
          <div className="px-4 pt-3 pb-1">
            <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-2">Browse by</p>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {BROWSE_CATS.map(cat => (
                <CategoryPill key={cat.id} cat={cat} onClick={setCategory} />
              ))}
            </div>
          </div>

          {/* 3. Trending — jobs, services, listings mix */}
          <div className="px-4 pt-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-[11px] font-bold text-foreground/60 uppercase tracking-widest">Active Nearby</span>
            </div>
            <div className="bg-card border border-border/20 rounded-2xl px-3 divide-y divide-border/10">
              {allListings
                .filter(l => ["jobs","services","cars","housing","events"].includes(l.category))
                .sort((a, b) => ((b.views || 0) + (b.saves || 0) * 3) - ((a.views || 0) + (a.saves || 0) * 3))
                .slice(0, 6)
                .map((l, i) => <TrendingRow key={l.id} listing={l} index={i} />)}
            </div>
          </div>

          {/* 4. Community listings feed */}
          <div className="px-4 pt-5">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Users className="w-3.5 h-3.5 text-primary/70" />
              <span className="text-[11px] font-bold text-foreground/60 uppercase tracking-widest">From the Community</span>
            </div>
            <div className="space-y-3">
              {allListings
                .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
                .slice(0, 5)
                .map((l, i) => <FeedItem key={l.id} listing={l} variant={i === 0 ? "hero" : "compact"} />)}
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