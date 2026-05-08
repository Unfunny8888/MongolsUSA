import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Search as SearchIcon, Mic, X, TrendingUp, Clock, Sparkles, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import ListingCard from "../components/cards/ListingCard";
import { MOCK_LISTINGS, TRENDING_SEARCHES } from "../lib/mockData";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem("nomadlink_recent");
    return saved ? JSON.parse(saved) : [];
  });
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSearch(searchQuery) {
    const q = searchQuery || query;
    if (!q.trim()) return;

    setLoading(true);
    setSearched(true);

    // Save to recent
    const updated = [q, ...recentSearches.filter((s) => s !== q)].slice(0, 8);
    setRecentSearches(updated);
    localStorage.setItem("nomadlink_recent", JSON.stringify(updated));

    // AI search using InvokeLLM
    const allListings = MOCK_LISTINGS;
    const listingSummaries = allListings.map((l) =>
      `[${l.id}] ${l.title} - ${l.category} - ${l.location_city} - $${l.price} - ${l.description?.slice(0, 100)}`
    ).join("\n");

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a search engine for a Mongolian community marketplace in the USA.
The user searched: "${q}"

The user might type in:
- English
- Mongolian (Cyrillic)
- Transliterated Mongolian (e.g., "mashin" = "машин" = car, "bair" = "байр" = housing, "ajil" = "ажил" = job)
- Mixed Mongolian-English
- Slang or typos

Available listings:
${listingSummaries}

Return the IDs of relevant listings ranked by relevance. Return ALL listings that could match, even loosely.`,
      response_json_schema: {
        type: "object",
        properties: {
          matching_ids: { type: "array", items: { type: "string" } },
          explanation: { type: "string" }
        }
      }
    });

    const matchedIds = response.matching_ids || [];
    const matched = matchedIds.map((id) => allListings.find((l) => l.id === id)).filter(Boolean);
    setResults(matched.length > 0 ? matched : allListings.slice(0, 3));
    setLoading(false);
  }

  function clearRecent() {
    setRecentSearches([]);
    localStorage.removeItem("nomadlink_recent");
  }

  return (
    <div className="min-h-screen">
      {/* Search Header */}
      <div className="glass sticky top-0 z-40 border-b border-border/30 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search in Mongolian or English..."
              className="w-full bg-secondary/70 rounded-xl pl-10 pr-10 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-smooth"
            />
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            {query && (
              <button onClick={() => { setQuery(""); setSearched(false); }} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <button
            onClick={() => handleSearch()}
            className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center hover:bg-primary/90 transition-smooth"
          >
            {loading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Sparkles className="w-5 h-5 text-white" />}
          </button>
        </div>
      </div>

      <div className="px-4 py-4">
        <AnimatePresence mode="wait">
          {!searched ? (
            <motion.div key="suggestions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-foreground">Recent Searches</h3>
                    <button onClick={clearRecent} className="text-xs text-muted-foreground hover:text-foreground transition-smooth">
                      Clear all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => { setQuery(s); handleSearch(s); }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary/70 text-xs font-medium text-foreground hover:bg-secondary transition-smooth"
                      >
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Trending Searches
                </h3>
                <div className="flex flex-wrap gap-2">
                  {TRENDING_SEARCHES.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => { setQuery(s); handleSearch(s); }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/5 border border-primary/10 text-xs font-medium text-foreground hover:bg-primary/10 transition-smooth"
                    >
                      <TrendingUp className="w-3 h-3 text-primary" />
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Tips */}
              <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10">
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-primary" />
                  AI Search Tips
                </h3>
                <ul className="text-xs text-muted-foreground space-y-1.5">
                  <li>🇲🇳 Type in Mongolian: "Чикаго дахь ажил"</li>
                  <li>🔤 Or transliterated: "ajil chicago"</li>
                  <li>🌐 Or English: "CDL job near me"</li>
                  <li>🔀 Mix them: "cheap mashin Chicago"</li>
                </ul>
              </div>
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                  </div>
                  <p className="text-sm font-medium text-foreground">AI is searching...</p>
                  <p className="text-xs text-muted-foreground mt-1">Understanding your query in both languages</p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground mb-4">
                    {results.length} results for "{query}"
                  </p>
                  <div className="space-y-3">
                    {results.map((l, i) => (
                      <ListingCard key={l.id} listing={l} index={i} />
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}