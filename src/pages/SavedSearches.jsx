import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Bell, BellOff, Trash2, Plus, Loader2, Sparkles, Car, Briefcase, Home, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";

const EXAMPLES = [
  { label: "Toyota Prius <$10k", icon: Car },
  { label: "Chicago apartments", icon: Home },
  { label: "CDL jobs", icon: Briefcase },
  { label: "iPhone for sale", icon: ShoppingBag },
];

async function parseSearchQuery(query) {
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `Parse this marketplace search query into structured filters. Query: "${query}"

Extract:
- keywords: main search terms (string)
- category: one of [cars, jobs, housing, services, electronics, events, community] or null
- location: city name or null
- price_max: maximum price as number or null

Examples:
"Toyota Prius under 10k" → {keywords: "Toyota Prius", category: "cars", location: null, price_max: 10000}
"Chicago 2br apartment" → {keywords: "2br apartment", category: "housing", location: "Chicago", price_max: null}
"CDL truck driver jobs" → {keywords: "CDL truck driver", category: "jobs", location: null, price_max: null}`,
    response_json_schema: {
      type: "object",
      properties: {
        keywords: { type: "string" },
        category: { type: "string" },
        location: { type: "string" },
        price_max: { type: "number" },
      }
    }
  });
  return result;
}

export default function SavedSearches() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newQuery, setNewQuery] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) { setLoading(false); return; }
      const me = await base44.auth.me();
      setUser(me);
      const data = await base44.entities.SavedSearch.filter({ user_email: me.email }, "-created_date", 20);
      setSearches(data);
      setLoading(false);
    }
    load();
  }, []);

  async function saveSearch(queryOverride) {
    const q = (queryOverride || newQuery).trim();
    if (!q || !user || saving) return;
    setSaving(true);
    const parsed = await parseSearchQuery(q).catch(() => ({}));
    const created = await base44.entities.SavedSearch.create({
      user_email: user.email,
      query: q,
      category: parsed.category || "",
      location: parsed.location || "",
      price_max: parsed.price_max || null,
      notify: true,
    });
    setSearches((prev) => [created, ...prev]);
    setNewQuery("");
    setSaving(false);
  }

  async function toggleNotify(search) {
    await base44.entities.SavedSearch.update(search.id, { notify: !search.notify });
    setSearches((prev) => prev.map((s) => s.id === search.id ? { ...s, notify: !s.notify } : s));
  }

  async function deleteSearch(id) {
    await base44.entities.SavedSearch.delete(id);
    setSearches((prev) => prev.filter((s) => s.id !== id));
  }

  if (!user && !loading) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center">
        <Search className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-lg font-bold mb-2">Sign in to save searches</h2>
        <button onClick={() => base44.auth.redirectToLogin()} className="px-6 py-2 bg-primary text-white rounded-xl text-sm font-semibold">Sign In</button>
      </div>
    );
  }

  return (
    <div className="min-h-dvh">


      <div className="px-4 py-4">
        {/* Hero */}
        <div className="mb-5 p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-primary">AI-Powered Alerts</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">Type any search in plain English — we'll parse it and notify you the moment a match appears.</p>
        </div>

        {/* Add new search */}
        <div className="flex gap-2 mb-3">
          <input
            value={newQuery}
            onChange={(e) => setNewQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveSearch()}
            placeholder='e.g. "Toyota Prius under $10k in Chicago"'
            className="flex-1 bg-secondary/70 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 border border-border/40"
          />
          <button
            onClick={() => saveSearch()}
            disabled={!newQuery.trim() || saving}
            className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-40 flex items-center gap-1.5 shrink-0"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

        {/* Quick examples */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-5">
          {EXAMPLES.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => saveSearch(label)}
              disabled={saving}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border/60 text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-primary transition-smooth"
            >
              <Icon className="w-3 h-3" /> {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : searches.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-14 h-14 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-base font-semibold mb-1">No saved searches</p>
            <p className="text-sm text-muted-foreground">Save searches to get notified when new matches appear.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {searches.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-card rounded-2xl border border-border/50 px-4 py-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Search className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        onClick={() => navigate(`/explore?q=${encodeURIComponent(s.query)}`)}
                        className="text-sm font-semibold leading-tight cursor-pointer hover:text-primary transition-colors"
                      >
                        {s.query}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {s.category && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold capitalize">{s.category}</span>
                        )}
                        {s.location && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">📍 {s.location}</span>
                        )}
                        {s.price_max && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">Under ${s.price_max.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => toggleNotify(s)}
                        className={`p-2 rounded-lg transition-colors ${s.notify ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-secondary"}`}
                        title={s.notify ? "Notifications on" : "Notifications off"}
                      >
                        {s.notify ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => deleteSearch(s.id)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 ml-12">
                    <button
                      onClick={() => navigate(`/explore?q=${encodeURIComponent(s.query)}${s.category ? `&category=${s.category}` : ""}`)}
                      className="text-[11px] text-primary font-semibold hover:underline"
                    >
                      View matching listings →
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}