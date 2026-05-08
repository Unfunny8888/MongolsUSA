import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, Search as SearchIcon, X, TrendingUp, Clock, Sparkles, Loader2, AlertCircle, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ListingCard from "../components/cards/ListingCard";
import { MOCK_LISTINGS, TRENDING_SEARCHES } from "../lib/mockData";
import { useQueryCache } from "../hooks/useQueryCache";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { base44 } from "@/api/base44Client";

// ── Skeleton shimmer card ──────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-card rounded-2xl border border-border/50 overflow-hidden animate-pulse">
      <div className="aspect-[16/10] bg-secondary/70" />
      <div className="p-3.5 space-y-2">
        <div className="h-3.5 bg-secondary rounded w-3/4" />
        <div className="h-3 bg-secondary rounded w-1/2" />
        <div className="h-3 bg-secondary rounded w-1/3" />
      </div>
    </div>
  );
}

function SkeletonList({ count = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}

// ── Results with infinite scroll ───────────────────────────────────────
function InfiniteResults({ results }) {
  const { visible, sentinelRef, hasMore } = useInfiniteScroll(results, 15);
  return (
    <div className="space-y-3">
      {visible.map((l, i) => <ListingCard key={l.id} listing={l} index={i} />)}
      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-4">
          <div className="w-6 h-6 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

// ── dismiss keyboard helper ────────────────────────────────────────────
function dismissKeyboard(inputRef) {
  if (inputRef?.current) {
    inputRef.current.blur();
  }
  if (document.activeElement) document.activeElement.blur();
}

// ── quick local keyword filter ─────────────────────────────────────────
function localFilter(listings, q) {
  const qLower = q.toLowerCase();
  return listings.filter(l =>
    (l.title || "").toLowerCase().includes(qLower) ||
    (l.description || "").toLowerCase().includes(qLower) ||
    (l.category || "").toLowerCase().includes(qLower) ||
    (l.location_city || "").toLowerCase().includes(qLower)
  );
}

const CATEGORIES = [
  { id: "housing", label: "Housing", icon: "🏠" },
  { id: "jobs", label: "Jobs", icon: "💼" },
  { id: "events", label: "Events", icon: "🎉" },
  { id: "cars", label: "Cars", icon: "🚗" },
  { id: "services", label: "Services", icon: "🔧" },
  { id: "electronics", label: "Electronics", icon: "📱" },
];

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null);
  const [searchedQuery, setSearchedQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem("nomadlink_recent") || "[]"); } catch { return []; }
  });

  const inputRef = useRef(null);
  const navigate = useNavigate();
  const cache = useQueryCache(120000);
  const allListingsRef = useRef(MOCK_LISTINGS);
  const abortRef = useRef(null);
  const isSearchingRef = useRef(false);
  const debounceRef = useRef(null);

  // Pre-load listings once
  useEffect(() => {
    const cached = cache.get("search_listings");
    if (cached) { allListingsRef.current = cached; return; }
    base44.entities.Listing.filter({ status: "active" }, "-created_date", 300).then(data => {
      if (data?.length > 0) {
        allListingsRef.current = data;
        cache.set("search_listings", data);
      }
    }).catch(() => {});
  }, []);

  // Auto-focus input on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const saveRecent = useCallback((q) => {
    setRecentSearches(prev => {
      const updated = [q, ...prev.filter(s => s !== q)].slice(0, 8);
      localStorage.setItem("nomadlink_recent", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const executeSearch = useCallback(async (q) => {
    const trimmed = q?.trim();
    if (!trimmed) return;

    if (isSearchingRef.current) {
      abortRef.current?.abort();
    }
    isSearchingRef.current = true;

    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setSearched(true);
    setSearchedQuery(trimmed);
    setError(null);
    setResults([]);

    dismissKeyboard(inputRef);
    saveRecent(trimmed);

    const localMatches = localFilter(allListingsRef.current, trimmed);
    if (localMatches.length > 0) setResults(localMatches.slice(0, 20));

    try {
      const listingSummaries = allListingsRef.current.slice(0, 150).map(l =>
        `[${l.id}] ${l.title} - ${l.category} - ${l.location_city} - $${l.price || 0} - ${(l.description || "").slice(0, 80)}`
      ).join("\n");

      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000));
      const response = await Promise.race([
        base44.integrations.Core.InvokeLLM({
          prompt: `You are a search engine for a Mongolian community marketplace in the USA.
The user searched: "${trimmed}"

Mongolian transliteration map: mashin=car, bair=apartment, ajil=job, zarna=for sale, hugatsaagui=flexible

Available listings:
${listingSummaries}

Return the IDs of relevant listings ranked by relevance. Cast a wide net.`,
          response_json_schema: {
            type: "object",
            properties: {
              matching_ids: { type: "array", items: { type: "string" } }
            }
          }
        }),
        timeoutPromise
      ]);

      if (controller.signal.aborted) return;

      const matchedIds = response.matching_ids || [];
      const aiMatched = matchedIds
        .map(id => allListingsRef.current.find(l => l.id === id))
        .filter(Boolean);

      if (aiMatched.length > 0) {
        setResults(aiMatched);
        setErrorType(null);
      } else if (localMatches.length === 0) {
        setResults([]);
        setErrorType(null);
      }
    } catch (err) {
      if (controller.signal.aborted) return;
      const isTimeout = err.message === 'timeout';
      const isNetworkError = err.message?.includes('fetch') || err.message?.includes('network');
      setErrorType(isTimeout ? 'timeout' : isNetworkError ? 'network' : 'ai_failed');
      if (localMatches.length === 0) {
        setError("Showing local results instead.");
        setResults(allListingsRef.current.slice(0, 10));
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        isSearchingRef.current = false;
      }
    }
  }, [saveRecent]);

  const handleSearch = useCallback((overrideQuery) => {
    const q = overrideQuery ?? query;
    executeSearch(q);
  }, [query, executeSearch]);

  const handleInputChange = useCallback((e) => {
    setQuery(e.target.value);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter") {
      clearTimeout(debounceRef.current);
      handleSearch();
    }
  }, [handleSearch]);

  const handleSuggestionTap = useCallback((s) => {
    setQuery(s);
    clearTimeout(debounceRef.current);
    executeSearch(s);
  }, [executeSearch]);

  const clearRecent = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem("nomadlink_recent");
  }, []);

  const clearSearch = useCallback(() => {
    abortRef.current?.abort();
    isSearchingRef.current = false;
    setQuery("");
    setSearched(false);
    setLoading(false);
    setResults([]);
    setError(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const filterByCategory = useCallback((categoryId) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categoryId);
    }
  }, [selectedCategory]);

  const filteredResults = results.filter(r => {
    const categoryMatch = !selectedCategory || r.category === selectedCategory;
    const cityMatch = !selectedCity || r.location_city === selectedCity;
    return categoryMatch && cityMatch;
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* City Select */}
      <div className="glass fixed top-0 left-0 right-0 z-40 border-b border-border/30 px-4 py-2 shadow-sm" style={{ paddingTop: 'max(8px, env(safe-area-inset-top))' }}>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
          <button
            onClick={() => setSelectedCity(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-smooth ${
              !selectedCity
                ? "bg-primary text-white"
                : "bg-secondary/70 text-foreground hover:bg-secondary"
            }`}
          >
            All Cities
          </button>
          {[...new Set(allListingsRef.current.map(l => l.location_city).filter(Boolean))].slice(0, 8).map(city => (
            <button
              key={city}
              onClick={() => setSelectedCity(selectedCity === city ? null : city)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-smooth ${
                selectedCity === city
                  ? "bg-primary text-white"
                  : "bg-secondary/70 text-foreground hover:bg-secondary"
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Search Header */}
      <div className="glass fixed top-10 left-0 right-0 z-40 border-b border-border/30 px-4 py-3 shadow-sm" style={{ paddingBottom: '12px' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 shrink-0">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Search in Mongolian or English..."
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              inputMode="search"
              enterKeyHint="search"
              className="w-full bg-secondary/70 rounded-xl pl-10 pr-10 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-smooth"
            />
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            {query ? (
              <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 p-1">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            ) : null}
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
            className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center hover:bg-primary/90 transition-smooth disabled:opacity-60 shrink-0"
          >
            {loading
              ? <Loader2 className="w-4 h-4 text-white animate-spin" />
              : <Sparkles className="w-4 h-4 text-white" />
            }
          </button>
        </div>
      </div>

      {/* Body */}
      <div
        className="flex-1 px-4 py-4 overflow-y-auto mt-44"
        onScroll={() => dismissKeyboard(inputRef)}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <AnimatePresence mode="wait">
          {!searched ? (
            <motion.div
              key="suggestions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {recentSearches.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold">Recent</h3>
                    <button onClick={clearRecent} className="text-xs text-muted-foreground">Clear</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((s, i) => (
                      <button
                        key={i}
                        onPointerDown={(e) => { e.preventDefault(); handleSuggestionTap(s); }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary/70 text-xs font-medium text-foreground active:bg-secondary transition-smooth"
                      >
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Trending
                </h3>
                <div className="flex flex-wrap gap-2">
                  {TRENDING_SEARCHES.map((s, i) => (
                    <button
                      key={i}
                      onPointerDown={(e) => { e.preventDefault(); handleSuggestionTap(s); }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/5 border border-primary/10 text-xs font-medium text-foreground active:bg-primary/15 transition-smooth"
                    >
                      <TrendingUp className="w-3 h-3 text-primary" />
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10">
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-primary" />
                  AI Search Tips
                </h3>
                <ul className="text-xs text-muted-foreground space-y-1.5">
                  <li>🇲🇳 Mongolian: "Чикаго дахь ажил"</li>
                  <li>🔤 Transliterated: "ajil chicago"</li>
                  <li>🌐 English: "CDL job near me"</li>
                  <li>🔀 Mixed: "cheap mashin Chicago"</li>
                </ul>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              {/* Header row */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-muted-foreground">
                  {loading
                    ? <span className="flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" /> Searching with AI…</span>
                    : `${filteredResults.length} results for "${searchedQuery}"`
                  }
                </p>
              </div>

              {/* Error banner */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100 mb-4 text-xs text-amber-700">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                  {errorType === 'timeout' && ' (Request timed out)'}
                  {errorType === 'network' && ' (Network issue)'}
                </div>
              )}

              {/* Loading skeletons */}
              <AnimatePresence mode="wait">
                {loading && results.length === 0 ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SkeletonList count={4} />
                  </motion.div>
                ) : filteredResults.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col items-center justify-center py-20 text-center"
                  >
                    {errorType === 'timeout' ? (
                      <>
                        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4 text-3xl">⏱️</div>
                        <p className="text-sm font-semibold text-foreground">Search timed out</p>
                        <p className="text-xs text-muted-foreground mt-1">Your network is slow. Try again or use simpler keywords.</p>
                      </>
                    ) : errorType === 'network' ? (
                      <>
                        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4 text-3xl">📡</div>
                        <p className="text-sm font-semibold text-foreground">Network error</p>
                        <p className="text-xs text-muted-foreground mt-1">Check your connection and try again.</p>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4 text-3xl">🔍</div>
                        <p className="text-sm font-semibold text-foreground">No matching results found</p>
                        <p className="text-xs text-muted-foreground mt-1">Try different keywords or browse by category</p>
                      </>
                    )}
                    <button
                      onClick={clearSearch}
                      className="mt-4 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold"
                    >
                      {errorType ? 'Try again' : 'Clear search'}
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <InfiniteResults results={filteredResults} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}