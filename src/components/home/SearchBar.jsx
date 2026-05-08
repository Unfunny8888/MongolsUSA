import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Sparkles, X, Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { MOCK_LISTINGS, MOCK_BUSINESSES, MOCK_GROUPS } from "../../lib/mockData";

const SUGGESTIONS = [
  "CDL trucking jobs near Chicago",
  "Apartment under $1,500/month",
  "Toyota Prius under $8,000",
  "Mongolian restaurants nearby",
  "Cash jobs available today",
  "2-bedroom furnished housing",
];

export default function SearchBar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  const runAISearch = useCallback(async (text) => {
    if (!text.trim()) { setResults(null); return; }
    setLoading(true);

    const [dbL, dbB] = await Promise.allSettled([
      base44.entities.Listing.list("-created_date", 30),
      base44.entities.Business.list("-rating", 10),
    ]);
    const allListings = dbL.status === "fulfilled" && dbL.value.length ? dbL.value : MOCK_LISTINGS;
    const allBiz = dbB.status === "fulfilled" && dbB.value.length ? dbB.value : MOCK_BUSINESSES;

    const listingSummaries = allListings.slice(0, 40).map((l) =>
      `[${l.id}] ${l.title} | ${l.category} | ${l.location_city || ""} | $${l.price || "contact"}`
    ).join("\n");
    const bizSummaries = allBiz.slice(0, 20).map((b) =>
      `[${b.id}] ${b.name} | ${b.category} | ${b.city}`
    ).join("\n");
    const groupSummaries = MOCK_GROUPS.slice(0, 10).map((g) =>
      `[${g.id}] ${g.name} | ${g.city}`
    ).join("\n");

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are NomadLink's universal search engine for the Mongolian diaspora in the USA.
User searched: "${text}"
Understand transliterated Mongolian: mashin=car, bair=housing/apartment, ajil=job, zoogiin gazar=restaurant.

Listings:
${listingSummaries}

Businesses:
${bizSummaries}

Groups:
${groupSummaries}

Return the top matching IDs (max 3 listings, 2 businesses, 1 group) and a very short label (5 words max) describing the result category.`,
      response_json_schema: {
        type: "object",
        properties: {
          label: { type: "string" },
          listing_ids: { type: "array", items: { type: "string" } },
          business_ids: { type: "array", items: { type: "string" } },
          group_ids: { type: "array", items: { type: "string" } },
        },
      },
    });

    const matchedListings = (result.listing_ids || []).map((id) => allListings.find((l) => l.id === id)).filter(Boolean).slice(0, 3);
    const matchedBiz = (result.business_ids || []).map((id) => allBiz.find((b) => b.id === id)).filter(Boolean).slice(0, 2);
    const matchedGroups = (result.group_ids || []).map((id) => MOCK_GROUPS.find((g) => g.id === id)).filter(Boolean).slice(0, 1);

    setResults({ label: result.label, listings: matchedListings, businesses: matchedBiz, groups: matchedGroups });
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults(null); setLoading(false); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runAISearch(query), 600);
    return () => clearTimeout(debounceRef.current);
  }, [query, runAISearch]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick);
    return () => { document.removeEventListener("mousedown", handleClick); document.removeEventListener("touchstart", handleClick); };
  }, []);

  const isOpen = focused && (query.length > 0 || true);
  const hasResults = results && (results.listings?.length > 0 || results.businesses?.length > 0 || results.groups?.length > 0);

  return (
    <div ref={containerRef} className="px-4 py-3 relative z-30">
      {/* Search bar */}
      <motion.div
        animate={{ scale: focused ? 1.01 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 border transition-all duration-200 ${
          focused
            ? "bg-card border-primary/40 shadow-xl shadow-primary/10"
            : "bg-secondary/60 border-border/50 shadow-sm"
        }`}
        style={{ backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
      >
        <div className="relative w-5 h-5 shrink-0">
          {loading ? (
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          ) : focused ? (
            <Sparkles className="w-5 h-5 text-primary" />
          ) : (
            <Search className="w-5 h-5 text-muted-foreground" />
          )}
        </div>

        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder={focused ? "Ask anything... jobs, housing, cars..." : "AI Search — jobs, housing, cars..."}
          className="flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground text-foreground"
          style={{ fontSize: "16px" }}
        />

        <AnimatePresence>
          {query.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => { setQuery(""); setResults(null); inputRef.current?.focus(); }}
              className="w-6 h-6 rounded-full bg-muted-foreground/20 flex items-center justify-center shrink-0"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </motion.button>
          )}
        </AnimatePresence>

        {!query && (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        )}
      </motion.div>

      {/* Dropdown */}
      <AnimatePresence>
        {focused && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
            className="absolute left-4 right-4 top-full mt-1 bg-card/95 rounded-2xl border border-border/60 shadow-2xl overflow-hidden"
            style={{ backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}
          >
            {/* Suggestions (no query) */}
            {!query && (
              <div className="p-3">
                <p className="text-[10px] font-semibold text-muted-foreground px-1 mb-2 uppercase tracking-wide">Try asking</p>
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onMouseDown={(e) => { e.preventDefault(); setQuery(s); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/60 text-left transition-colors group"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-primary/60 shrink-0" />
                    <span className="text-sm text-foreground/80 flex-1">{s}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                  </button>
                ))}
              </div>
            )}

            {/* AI Results */}
            {query && !loading && !hasResults && (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-muted-foreground">No results found for "{query}"</p>
              </div>
            )}

            {query && loading && (
              <div className="flex items-center gap-3 px-4 py-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Searching with AI...</p>
                  <div className="flex gap-1 mt-1">
                    {[0, 150, 300].map((d) => (
                      <div key={d} className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {hasResults && (
              <div className="p-3">
                {results.label && (
                  <p className="text-[10px] font-semibold text-primary px-1 mb-2 uppercase tracking-wide">{results.label}</p>
                )}

                {results.listings?.map((l) => (
                  <button
                    key={l.id}
                    onMouseDown={(e) => { e.preventDefault(); navigate(`/listing/${l.id}`); setFocused(false); }}
                    className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-secondary/60 text-left transition-colors"
                  >
                    <img
                      src={l.images?.[0] || "https://images.unsplash.com/photo-1557683316-973673baf926?w=80"}
                      alt={l.title}
                      className="w-10 h-10 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{l.title}</p>
                      <p className="text-[10px] text-muted-foreground">{l.price ? `$${l.price.toLocaleString()}` : "Contact"}{l.location_city ? ` · ${l.location_city}` : ""}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                  </button>
                ))}

                {results.businesses?.map((b) => (
                  <button
                    key={b.id}
                    onMouseDown={(e) => { e.preventDefault(); navigate(`/business/${b.id}`); setFocused(false); }}
                    className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-secondary/60 text-left transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg shrink-0">🏪</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{b.name}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">{b.category}{b.city ? ` · ${b.city}` : ""}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                  </button>
                ))}

                {results.groups?.map((g) => (
                  <button
                    key={g.id}
                    onMouseDown={(e) => { e.preventDefault(); navigate(`/group/${g.id}`); setFocused(false); }}
                    className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-secondary/60 text-left transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-lg shrink-0">👥</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{g.name}</p>
                      <p className="text-[10px] text-muted-foreground">{g.city} · {g.member_count} members</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                  </button>
                ))}

                <button
                  onMouseDown={(e) => { e.preventDefault(); navigate(`/explore?q=${encodeURIComponent(query)}`); setFocused(false); }}
                  className="w-full flex items-center justify-center gap-2 mt-2 px-3 py-2.5 rounded-xl bg-primary/5 border border-primary/15 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
                >
                  See all results for "{query}" <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}