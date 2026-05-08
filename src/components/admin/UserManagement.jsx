import { useState } from "react";
import { Shield, Ban, Eye, EyeOff, UserX, CheckCircle, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";

export default function UserManagement({ users, bans, setBans }) {
  const [expanded, setExpanded] = useState(null);
  const [banModal, setBanModal] = useState(null); // { user, type }
  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState("permanent");
  const [search, setSearch] = useState("");

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  function isUserBanned(email) {
    return bans.find(b => b.user_email === email && b.is_active);
  }

  async function banUser(user, type) {
    if (!banReason.trim()) return;
    const expires_at = banDuration === "7d"
      ? new Date(Date.now() + 7 * 86400000).toISOString()
      : banDuration === "30d"
        ? new Date(Date.now() + 30 * 86400000).toISOString()
        : null;

    const ban = await base44.entities.UserBan.create({
      user_email: user.email,
      user_name: user.full_name,
      ban_type: type,
      reason: banReason,
      banned_by: "admin",
      ...(expires_at ? { expires_at } : {}),
      is_active: true,
    });
    setBans(p => [ban, ...p]);
    setBanModal(null);
    setBanReason("");
    setBanDuration("permanent");
  }

  async function unban(ban) {
    await base44.entities.UserBan.update(ban.id, { is_active: false });
    setBans(p => p.map(b => b.id === ban.id ? { ...b, is_active: false } : b));
  }

  return (
    <div className="space-y-3">
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search users..."
        className="w-full bg-secondary/70 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
      />

      {/* Active bans summary */}
      {bans.filter(b => b.is_active).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
          <Ban className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-xs text-red-700 font-semibold">{bans.filter(b => b.is_active).length} active ban(s)</p>
        </div>
      )}

      {filtered.map((u, i) => {
        const activeBan = isUserBanned(u.email);
        const isExpanded = expanded === u.id;
        return (
          <motion.div key={u.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
            className={`bg-card rounded-xl border overflow-hidden ${activeBan ? "border-red-200" : "border-border/50"}`}>
            <div className="p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg overflow-hidden shrink-0">
                {u.avatar ? <img src={u.avatar} alt={u.full_name} className="w-full h-full object-cover" /> : "👤"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold truncate">{u.full_name}</p>
                  {activeBan && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${activeBan.ban_type === "shadow" ? "bg-gray-200 text-gray-700" : "bg-red-100 text-red-700"}`}>
                      {activeBan.ban_type === "shadow" ? "👻 Shadow" : "🚫 Banned"}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground truncate">{u.email}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${u.role === "admin" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
                  {u.role}
                </span>
                <button onClick={() => setExpanded(isExpanded ? null : u.id)} className="p-1.5 rounded-lg hover:bg-secondary">
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="px-3 pb-3 border-t border-border/30 pt-2 space-y-2">
                    <p className="text-[10px] text-muted-foreground">Member since: {u.created_date ? new Date(u.created_date).toLocaleDateString() : "—"}</p>
                    {activeBan ? (
                      <div className="space-y-1.5">
                        <p className="text-[10px] text-red-600">Reason: {activeBan.reason}</p>
                        <button onClick={() => unban(activeBan)}
                          className="w-full py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-emerald-200">
                          <CheckCircle className="w-3 h-3" /> Remove Ban
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={() => setBanModal({ user: u, type: "full" })}
                          className="flex-1 py-1.5 rounded-lg bg-red-100 text-red-700 text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-red-200">
                          <Ban className="w-3 h-3" /> Full Ban
                        </button>
                        <button onClick={() => setBanModal({ user: u, type: "shadow" })}
                          className="flex-1 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-gray-200">
                          <EyeOff className="w-3 h-3" /> Shadow Ban
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {/* Ban Modal */}
      <AnimatePresence>
        {banModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4"
            onClick={() => setBanModal(null)}>
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
              className="bg-card rounded-2xl p-5 w-full max-w-md space-y-4"
              onClick={e => e.stopPropagation()}>
              <div>
                <h3 className="text-sm font-bold">
                  {banModal.type === "shadow" ? "👻 Shadow Ban" : "🚫 Ban"} {banModal.user.full_name}
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {banModal.type === "shadow"
                    ? "User can still post but content is hidden from others."
                    : "User will be fully blocked from the platform."}
                </p>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">Reason</label>
                <textarea
                  value={banReason}
                  onChange={e => setBanReason(e.target.value)}
                  placeholder="Why is this user being banned?"
                  rows={2}
                  className="w-full bg-secondary/70 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">Duration</label>
                <div className="flex gap-2">
                  {["7d", "30d", "permanent"].map(d => (
                    <button key={d} onClick={() => setBanDuration(d)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-semibold ${banDuration === d ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}>
                      {d === "7d" ? "7 Days" : d === "30d" ? "30 Days" : "Permanent"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setBanModal(null)}
                  className="flex-1 py-2 rounded-xl bg-secondary text-muted-foreground text-sm font-semibold">Cancel</button>
                <button onClick={() => banUser(banModal.user, banModal.type)}
                  disabled={!banReason.trim()}
                  className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold disabled:opacity-40">
                  Confirm Ban
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}