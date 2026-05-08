import { useState, useEffect } from "react";
import { ArrowLeft, SlidersHorizontal, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ListingCard from "../components/cards/ListingCard";
import CategoryChip from "../components/cards/CategoryChip";
import { MOCK_LISTINGS, CATEGORIES, CITIES } from "../lib/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Explore() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const initCat = urlParams.get("category") || "";
  const initFeatured = urlParams.get("featured") === "true";

  const [category, setCategory] = useState(initCat);
  const [city, setCity] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = MOCK_LISTINGS.filter((l) => {
    if (category && l.category !== category) return false;
    if (city && l.location_city !== city) return false;
    if (initFeatured && !l.is_featured) return false;
    return true;
  });

  const activeFilters = [category, city].filter(Boolean).length;

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
                <div className="flex flex-wrap gap-2">
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
                {(category || city) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setCategory(""); setCity(""); }}
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
        <div className="space-y-3">
          {filtered.map((l, i) => (
            <ListingCard key={l.id} listing={l} index={i} />
          ))}
        </div>
        {filtered.length === 0 && (
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