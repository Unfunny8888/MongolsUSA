import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Bell, BellOff, Trash2, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";

export default function SavedSearches() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newQuery, setNewQuery] = useState("");

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

  async function saveSearch() {
    if (!newQuery.trim() || !user) return;
    const created = await base44.entities.SavedSearch.create({
      user_email: user.email,
      query: newQuery.trim(),
      notify: true,
    });
    setSearches((prev) => [created, ...prev]);
    setNewQuery("");
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
      <div className="glass sticky top-0 z-40 border-b border-border/30 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-base font-bold flex-1">Saved Searches</h1>
      </div>

      <div className="px-4 py-4">
        {/* Add new search */}
        <div className="flex gap-2 mb-6">
          <input
            value={newQuery}
            onChange={(e) => setNewQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveSearch()}
            placeholder='e.g. "CDL jobs Chicago" or "Prius under 8k"'
            className="flex-1 bg-secondary/70 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 border border-border/40"
          />
          <button
            onClick={saveSearch}
            disabled={!newQuery.trim()}
            className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-40 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Save
          </button>
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
            {searches.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl border border-border/50 px-4 py-3 flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Search className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    onClick={() => navigate(`/explore?q=${encodeURIComponent(s.query)}`)}
                    className="text-sm font-semibold truncate cursor-pointer hover:text-primary transition-colors"
                  >
                    {s.query}
                  </p>
                  {(s.category || s.location) && (
                    <p className="text-[10px] text-muted-foreground">
                      {[s.category, s.location].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => toggleNotify(s)}
                  className={`p-2 rounded-lg transition-colors ${s.notify ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-secondary"}`}
                >
                  {s.notify ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => deleteSearch(s.id)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}