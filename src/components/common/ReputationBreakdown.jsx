import { useState } from "react";
import { ChevronDown, ChevronUp, Star, Clock, MessageSquare, Users, ShoppingBag, AlertTriangle, ShieldCheck, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const RANK_CONFIG = {
  bronze: {
    label: "Bronze",
    range: "0–34",
    gradient: "from-amber-700 to-amber-500",
    ring: "ring-amber-400",
    next: "silver",
    nextAt: 35,
  },
  silver: {
    label: "Silver",
    range: "35–59",
    gradient: "from-slate-500 to-slate-400",
    ring: "ring-slate-400",
    next: "gold",
    nextAt: 60,
  },
  gold: {
    label: "Gold",
    range: "60–79",
    gradient: "from-yellow-500 to-amber-400",
    ring: "ring-yellow-400",
    next: "elite",
    nextAt: 80,
  },
  elite: {
    label: "Elite",
    range: "80–100",
    gradient: "from-purple-600 to-violet-500",
    ring: "ring-purple-400",
    next: null,
    nextAt: null,
  },
};

const SCORE_ITEMS = [
  { key: "accountAge", label: "Account Age", max: 15, icon: Clock, color: "text-blue-500" },
  { key: "listings", label: "Listings Posted", max: 10, icon: TrendingUp, color: "text-emerald-500" },
  { key: "sales", label: "Successful Sales", max: 20, icon: ShoppingBag, color: "text-green-600" },
  { key: "reviews", label: "Reviews Received", max: 20, icon: Star, color: "text-yellow-500" },
  { key: "responseRate", label: "Response Speed", max: 15, icon: MessageSquare, color: "text-indigo-500" },
  { key: "communityActivity", label: "Community Activity", max: 10, icon: Users, color: "text-teal-500" },
  { key: "verificationBonus", label: "Verifications", max: 25, icon: ShieldCheck, color: "text-primary" },
  { key: "reports", label: "Reports / Flags", max: 0, icon: AlertTriangle, color: "text-red-500", penalty: true },
];

export default function ReputationBreakdown({ user, breakdown }) {
  const [expanded, setExpanded] = useState(false);
  if (!user) return null;

  const score = user.trust_score || user.reputation_score || 0;
  const rank = user.reputation_rank || "bronze";
  const cfg = RANK_CONFIG[rank] || RANK_CONFIG.bronze;
  const toNextRank = cfg.nextAt ? Math.max(0, cfg.nextAt - score) : 0;

  return (
    <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
      {/* Rank Header */}
      <div className={`bg-gradient-to-r ${cfg.gradient} p-4 text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest opacity-80">Reputation Rank</p>
            <h3 className="text-2xl font-extrabold mt-0.5">{cfg.label}</h3>
            <p className="text-xs opacity-70 mt-0.5">Score range: {cfg.range} pts</p>
          </div>
          <div className={`w-16 h-16 rounded-2xl bg-white/20 ring-2 ${cfg.ring} flex items-center justify-center`}>
            <span className="text-3xl font-black">{score}</span>
          </div>
        </div>

        {cfg.next && (
          <div className="mt-3">
            <div className="flex justify-between text-[10px] opacity-70 mb-1">
              <span>{toNextRank} pts to {RANK_CONFIG[cfg.next]?.label}</span>
              <span>{score}/{cfg.nextAt}</span>
            </div>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/70 rounded-full transition-all"
                style={{ width: `${Math.min(100, (score / cfg.nextAt) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Breakdown Toggle */}
      {breakdown && (
        <>
          <button
            onClick={() => setExpanded(e => !e)}
            className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold hover:bg-secondary/40 transition-colors"
          >
            <span>Score Breakdown</span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-2">
                  {SCORE_ITEMS.map(item => {
                    const val = breakdown[item.key] || 0;
                    const pct = item.penalty ? Math.abs(val) / 20 * 100 : (item.max > 0 ? (val / item.max) * 100 : 0);
                    return (
                      <div key={item.key}>
                        <div className="flex items-center justify-between mb-0.5">
                          <div className="flex items-center gap-1.5">
                            <item.icon className={`w-3 h-3 ${item.color}`} />
                            <span className="text-[11px] font-medium">{item.label}</span>
                          </div>
                          <span className={`text-[11px] font-bold ${item.penalty && val < 0 ? "text-red-500" : "text-foreground"}`}>
                            {val > 0 ? `+${val}` : val}
                            {!item.penalty && item.max > 0 && <span className="text-muted-foreground font-normal">/{item.max}</span>}
                          </span>
                        </div>
                        <div className="h-1 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${item.penalty ? "bg-red-400" : "bg-gradient-to-r from-primary/60 to-primary"}`}
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}