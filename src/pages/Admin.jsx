import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, BarChart2, Flag, CheckCircle, XCircle, Trash2, Users, ListChecks, Building, AlertTriangle, Bot, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";

const TABS = ["overview", "listings", "moderation", "users"];

const RISK_COLORS = {
  safe: "bg-emerald-100 text-emerald-700",
  low: "bg-blue-100 text-blue-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

export default function Admin() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState({ listings: 0, users: 0, businesses: 0, groups: 0 });
  const [listings, setListings] = useState([]);
  const [users, setUsers] = useState([]);
  const [modLogs, setModLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const me = await base44.auth.me();
      if (me?.role !== "admin") { navigate("/"); return; }
      setUser(me);
      const [ls, us, bs, gs, ml] = await Promise.allSettled([
        base44.entities.Listing.list("-created_date", 30),
        base44.entities.User.list("-created_date", 30),
        base44.entities.Business.list("-created_date", 10),
        base44.entities.Group.list("-member_count", 10),
        base44.entities.ModerationLog.list("-created_date", 50),
      ]);
      const lsData = ls.status === "fulfilled" ? ls.value : [];
      const usData = us.status === "fulfilled" ? us.value : [];
      setModLogs(ml.status === "fulfilled" ? ml.value : []);
      setListings(lsData);
      setUsers(usData);
      setStats({
        listings: lsData.length,
        users: usData.length,
        businesses: bs.status === "fulfilled" ? bs.value.length : 0,
        groups: gs.status === "fulfilled" ? gs.value.length : 0,
      });
      setLoading(false);
    }
    load();
  }, []);

  async function updateListingStatus(id, status) {
    await base44.entities.Listing.update(id, { status });
    setListings(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  }

  async function deleteListing(id) {
    await base44.entities.Listing.delete(id);
    setListings(prev => prev.filter(l => l.id !== id));
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!user) return null;

  const statCards = [
    { label: "Listings", value: stats.listings, icon: ListChecks, color: "from-blue-500 to-blue-600" },
    { label: "Users", value: stats.users, icon: Users, color: "from-emerald-500 to-emerald-600" },
    { label: "Businesses", value: stats.businesses, icon: Building, color: "from-orange-500 to-orange-600" },
    { label: "Groups", value: stats.groups, icon: Users, color: "from-purple-500 to-purple-600" },
  ];

  return (
    <div className="min-h-screen pb-24">
      <div className="glass sticky top-0 z-40 border-b border-border/30 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
        <Shield className="w-4 h-4 text-primary" />
        <h1 className="text-base font-bold flex-1">Admin Dashboard</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/30 px-4">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-3 text-xs font-semibold capitalize border-b-2 transition-smooth ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="px-4 py-4">
        {tab === "overview" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {statCards.map((s) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-gradient-to-br ${s.color} rounded-2xl p-4 text-white shadow-lg`}
                >
                  <s.icon className="w-6 h-6 mb-2 opacity-80" />
                  <p className="text-2xl font-extrabold">{s.value}</p>
                  <p className="text-xs opacity-80 font-medium">{s.label}</p>
                </motion.div>
              ))}
            </div>
            <div className="bg-card rounded-2xl p-4 border border-border/50">
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><Flag className="w-4 h-4 text-red-500" /> Flagged Content</h3>
              {listings.filter(l => l.status === "flagged").length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No flagged content ✅</p>
              ) : (
                listings.filter(l => l.status === "flagged").map(l => (
                  <div key={l.id} className="flex items-center gap-2 py-2 border-b border-border/30 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{l.title}</p>
                      <p className="text-[10px] text-muted-foreground">{l.category}</p>
                    </div>
                    <button onClick={() => updateListingStatus(l.id, "active")} className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600"><CheckCircle className="w-3.5 h-3.5" /></button>
                    <button onClick={() => deleteListing(l.id)} className="p-1.5 rounded-lg bg-red-100 text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {tab === "listings" && (
          <div className="space-y-2">
            {listings.map((l, i) => (
              <motion.div
                key={l.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-card rounded-xl p-3 border border-border/50 flex items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{l.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-muted-foreground">{l.category}</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                      l.status === "active" ? "bg-emerald-100 text-emerald-700" :
                      l.status === "flagged" ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>{l.status}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  {l.status !== "active" && (
                    <button onClick={() => updateListingStatus(l.id, "active")} className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200">
                      <CheckCircle className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {l.status !== "flagged" && (
                    <button onClick={() => updateListingStatus(l.id, "flagged")} className="p-1.5 rounded-lg bg-amber-100 text-amber-600 hover:bg-amber-200">
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button onClick={() => deleteListing(l.id)} className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {tab === "moderation" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-violet-50 border border-violet-200">
              <Bot className="w-5 h-5 text-violet-600" />
              <div>
                <p className="text-xs font-bold text-violet-800">AI Moderation Active</p>
                <p className="text-[10px] text-violet-600">Every new listing is automatically analyzed. {modLogs.filter(m => !m.admin_reviewed).length} pending review.</p>
              </div>
            </div>
            {modLogs.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">No moderation logs yet</p>
            ) : modLogs.map((log, i) => (
              <motion.div key={log.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="bg-card rounded-xl p-3 border border-border/50 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{log.listing_title}</p>
                    <p className="text-[10px] text-muted-foreground">{log.poster_email}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${RISK_COLORS[log.risk_level] || "bg-gray-100 text-gray-700"}`}>
                      {log.risk_level} ({log.risk_score})
                    </span>
                    {!log.admin_reviewed && <span className="w-2 h-2 rounded-full bg-amber-400" />}
                  </div>
                </div>
                {log.flags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {log.flags.map(f => <span key={f} className="text-[9px] px-1.5 py-0.5 rounded-md bg-red-50 text-red-700 font-medium">{f}</span>)}
                  </div>
                )}
                {log.explanation && <p className="text-[10px] text-muted-foreground leading-relaxed">{log.explanation}</p>}
                {log.actions_taken?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {log.actions_taken.map(a => <span key={a} className="text-[9px] px-1.5 py-0.5 rounded-md bg-secondary font-medium">{a.replace(/_/g, " ")}</span>)}
                  </div>
                )}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={async () => {
                      await base44.entities.ModerationLog.update(log.id, { admin_reviewed: true, admin_decision: "approved" });
                      await base44.entities.Listing.update(log.listing_id, { status: "active" });
                      setModLogs(p => p.map(l => l.id === log.id ? { ...l, admin_reviewed: true, admin_decision: "approved" } : l));
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center gap-1"
                  >
                    <CheckCircle className="w-3 h-3" /> Approve
                  </button>
                  <button
                    onClick={async () => {
                      await base44.entities.ModerationLog.update(log.id, { admin_reviewed: true, admin_decision: "removed" });
                      await base44.entities.Listing.update(log.listing_id, { status: "flagged" });
                      setModLogs(p => p.map(l => l.id === log.id ? { ...l, admin_reviewed: true, admin_decision: "removed" } : l));
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-red-100 text-red-700 text-[10px] font-bold flex items-center justify-center gap-1"
                  >
                    <XCircle className="w-3 h-3" /> Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {tab === "users" && (
          <div className="space-y-2">
            {users.map((u, i) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-card rounded-xl p-3 border border-border/50 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg overflow-hidden">
                  {u.avatar ? <img src={u.avatar} alt={u.full_name} className="w-full h-full object-cover" /> : "👤"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{u.full_name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{u.email}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${u.role === "admin" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
                  {u.role}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}