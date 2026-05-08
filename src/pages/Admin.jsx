import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, BarChart2, Flag, Bot, Users, ListChecks, Building, AlertTriangle, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import ModerationQueue from "../components/admin/ModerationQueue";
import ReportsList from "../components/admin/ReportsList";
import UserManagement from "../components/admin/UserManagement";
import FraudMonitor from "../components/admin/FraudMonitor";
import AdminAnalytics from "../components/admin/AdminAnalytics";

const TABS = [
  { id: "overview", label: "Overview", icon: Shield },
  { id: "moderation", label: "Queue", icon: Bot },
  { id: "reports", label: "Reports", icon: Flag },
  { id: "users", label: "Users", icon: Users },
  { id: "fraud", label: "Fraud", icon: AlertTriangle },
  { id: "analytics", label: "Stats", icon: BarChart2 },
];

export default function Admin() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState({ listings: 0, users: 0, businesses: 0, groups: 0 });
  const [listings, setListings] = useState([]);
  const [users, setUsers] = useState([]);
  const [modLogs, setModLogs] = useState([]);
  const [reports, setReports] = useState([]);
  const [bans, setBans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const me = await base44.auth.me();
      if (me?.role !== "admin") { navigate("/"); return; }
      setUser(me);
      const [ls, us, bs, gs, ml, rp, bn] = await Promise.allSettled([
        base44.entities.Listing.list("-created_date", 50),
        base44.entities.User.list("-created_date", 50),
        base44.entities.Business.list("-created_date", 10),
        base44.entities.Group.list("-member_count", 10),
        base44.entities.ModerationLog.list("-created_date", 50),
        base44.entities.Report.list("-created_date", 50),
        base44.entities.UserBan.list("-created_date", 50),
      ]);
      const lsData = ls.status === "fulfilled" ? ls.value : [];
      const usData = us.status === "fulfilled" ? us.value : [];
      setListings(lsData);
      setUsers(usData);
      setModLogs(ml.status === "fulfilled" ? ml.value : []);
      setReports(rp.status === "fulfilled" ? rp.value : []);
      setBans(bn.status === "fulfilled" ? bn.value : []);
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

  const pendingMod = modLogs.filter(m => !m.admin_reviewed).length;
  const pendingReports = reports.filter(r => r.status === "pending").length;

  const statCards = [
    { label: "Listings", value: stats.listings, icon: ListChecks, color: "from-blue-500 to-blue-600" },
    { label: "Users", value: stats.users, icon: Users, color: "from-emerald-500 to-emerald-600" },
    { label: "Businesses", value: stats.businesses, icon: Building, color: "from-orange-500 to-orange-600" },
    { label: "Groups", value: stats.groups, icon: Users, color: "from-purple-500 to-purple-600" },
  ];

  return (
    <div className="min-h-screen pb-24">


      {/* Tabs */}
      <div className="flex border-b border-border/30 px-2 overflow-x-auto no-scrollbar">
        {TABS.map(t => {
          const badge = t.id === "moderation" ? pendingMod : t.id === "reports" ? pendingReports : 0;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative px-3 py-3 text-[11px] font-semibold capitalize border-b-2 transition-smooth shrink-0 flex items-center gap-1 ${
                tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground"
              }`}
            >
              <t.icon className="w-3 h-3" />
              {t.label}
              {badge > 0 && (
                <span className="bg-red-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center ml-0.5">{badge}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="px-4 py-4">
        {tab === "overview" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {statCards.map((s) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`bg-gradient-to-br ${s.color} rounded-2xl p-4 text-white shadow-lg`}>
                  <s.icon className="w-6 h-6 mb-2 opacity-80" />
                  <p className="text-2xl font-extrabold">{s.value}</p>
                  <p className="text-xs opacity-80 font-medium">{s.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Quick alerts */}
            {pendingMod > 0 && (
              <button onClick={() => setTab("moderation")} className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-violet-50 border border-violet-200 hover:bg-violet-100 transition-smooth">
                <Bot className="w-5 h-5 text-violet-600 shrink-0" />
                <div className="flex-1 text-left">
                  <p className="text-xs font-bold text-violet-800">{pendingMod} items need moderation review</p>
                  <p className="text-[10px] text-violet-600">Tap to review AI queue</p>
                </div>
                <span className="bg-violet-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{pendingMod}</span>
              </button>
            )}
            {pendingReports > 0 && (
              <button onClick={() => setTab("reports")} className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200 hover:bg-red-100 transition-smooth">
                <Flag className="w-5 h-5 text-red-600 shrink-0" />
                <div className="flex-1 text-left">
                  <p className="text-xs font-bold text-red-800">{pendingReports} pending user reports</p>
                  <p className="text-[10px] text-red-600">Tap to review reports</p>
                </div>
                <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{pendingReports}</span>
              </button>
            )}
            {bans.filter(b => b.is_active).length > 0 && (
              <button onClick={() => setTab("users")} className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-smooth">
                <Users className="w-5 h-5 text-gray-600 shrink-0" />
                <p className="text-xs font-bold text-gray-800 flex-1 text-left">{bans.filter(b => b.is_active).length} active user bans</p>
              </button>
            )}

            {/* Flagged listings */}
            <div className="bg-card rounded-2xl p-4 border border-border/50">
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><Flag className="w-4 h-4 text-red-500" /> Flagged Listings</h3>
              {listings.filter(l => l.status === "flagged").length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No flagged content ✅</p>
              ) : listings.filter(l => l.status === "flagged").slice(0, 5).map(l => (
                <div key={l.id} className="flex items-center gap-2 py-2 border-b border-border/30 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{l.title}</p>
                    <p className="text-[10px] text-muted-foreground">{l.category}</p>
                  </div>
                  <button onClick={() => updateListingStatus(l.id, "active")} className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200">✓</button>
                  <button onClick={() => deleteListing(l.id)} className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200">✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "moderation" && (
          <ModerationQueue modLogs={modLogs} setModLogs={setModLogs} />
        )}

        {tab === "reports" && (
          <ReportsList reports={reports} setReports={setReports} />
        )}

        {tab === "users" && (
          <UserManagement users={users} bans={bans} setBans={setBans} />
        )}

        {tab === "fraud" && (
          <FraudMonitor listings={listings} reports={reports} bans={bans} />
        )}

        {tab === "analytics" && (
          <AdminAnalytics listings={listings} users={users} reports={reports} modLogs={modLogs} />
        )}
      </div>
    </div>
  );
}