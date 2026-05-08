import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Plus, Eye, Heart, Zap, Star, BarChart2, Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import BoostModal from "../components/common/BoostModal";
import { base44 } from "@/api/base44Client";

const STATUS_COLOR = {
  active: "bg-emerald-100 text-emerald-700",
  sold: "bg-blue-100 text-blue-700",
  expired: "bg-gray-100 text-gray-600",
  pending: "bg-amber-100 text-amber-700",
  flagged: "bg-red-100 text-red-700",
};

export default function MyListings() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [boostTarget, setBoostTarget] = useState(null);
  const [stats, setStats] = useState({ totalViews: 0, totalSaves: 0, active: 0 });

  useEffect(() => {
    async function load() {
      const me = await base44.auth.me();
      const items = await base44.entities.Listing.filter({ created_by: me.email }, "-created_date", 50);
      setListings(items);
      setStats({
        totalViews: items.reduce((s, l) => s + (l.views || 0), 0),
        totalSaves: items.reduce((s, l) => s + (l.saves || 0), 0),
        active: items.filter(l => l.status === "active").length,
      });
      setLoading(false);
    }
    load();
  }, []);

  async function deleteListing(id) {
    await base44.entities.Listing.delete(id);
    setListings(prev => prev.filter(l => l.id !== id));
  }

  async function toggleStatus(listing) {
    const newStatus = listing.status === "active" ? "sold" : "active";
    await base44.entities.Listing.update(listing.id, { status: newStatus });
    setListings(prev => prev.map(l => l.id === listing.id ? { ...l, status: newStatus } : l));
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="glass sticky top-0 z-40 border-b border-border/30 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-base font-bold flex-1">My Listings</h1>
        <button onClick={() => navigate("/create")} className="flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-3 py-2 rounded-xl">
          <Plus className="w-3.5 h-3.5" /> Post
        </button>
      </div>

      {/* Analytics Summary */}
      {!loading && listings.length > 0 && (
        <div className="px-4 py-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Eye, label: "Total Views", value: stats.totalViews, color: "from-blue-500 to-blue-600" },
              { icon: Heart, label: "Total Saves", value: stats.totalSaves, color: "from-pink-500 to-rose-500" },
              { icon: BarChart2, label: "Active", value: stats.active, color: "from-emerald-500 to-teal-500" },
            ].map(s => (
              <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-2xl p-3 text-white`}>
                <s.icon className="w-4 h-4 mb-1 opacity-80" />
                <p className="text-xl font-extrabold">{s.value}</p>
                <p className="text-[10px] opacity-80">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20 px-6">
          <BarChart2 className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-base font-semibold mb-1">No listings yet</p>
          <p className="text-sm text-muted-foreground mb-6">Start selling — post your first listing!</p>
          <button onClick={() => navigate("/create")} className="bg-primary text-white px-6 py-3 rounded-xl text-sm font-bold">+ Post Listing</button>
        </div>
      ) : (
        <div className="px-4 space-y-3">
          {listings.map((listing, i) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-card rounded-2xl border border-border/50 overflow-hidden"
            >
              <div className="flex gap-3 p-3">
                <Link to={`/listing/${listing.id}`} className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-secondary block">
                  {listing.images?.[0] && <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/listing/${listing.id}`}>
                    <p className="text-sm font-semibold line-clamp-2 leading-tight">{listing.title}</p>
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={`text-[10px] border-0 ${STATUS_COLOR[listing.status] || STATUS_COLOR.active}`}>{listing.status}</Badge>
                    {listing.is_featured && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                    {listing.is_boosted && <Zap className="w-3.5 h-3.5 text-primary fill-primary" />}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{listing.views || 0}</span>
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{listing.saves || 0}</span>
                  </div>
                </div>
              </div>
              <div className="border-t border-border/40 flex divide-x divide-border/40">
                <button
                  onClick={() => toggleStatus(listing)}
                  className="flex-1 py-2.5 text-[11px] font-semibold text-muted-foreground hover:bg-secondary/50 transition-smooth"
                >
                  Mark as {listing.status === "active" ? "Sold" : "Active"}
                </button>
                <button
                  onClick={() => setBoostTarget(listing)}
                  className="flex-1 py-2.5 text-[11px] font-semibold text-amber-600 hover:bg-amber-50 transition-smooth flex items-center justify-center gap-1"
                >
                  <Zap className="w-3 h-3" /> Boost
                </button>
                <button
                  onClick={() => deleteListing(listing.id)}
                  className="flex-1 py-2.5 text-[11px] font-semibold text-red-500 hover:bg-red-50 transition-smooth flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {boostTarget && (
        <BoostModal
          listingId={boostTarget.id}
          listingTitle={boostTarget.title}
          onClose={() => setBoostTarget(null)}
        />
      )}
    </div>
  );
}