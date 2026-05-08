import { useState } from "react";
import { Bot, CheckCircle, XCircle, Eye, AlertTriangle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";

const RISK_COLORS = {
  safe: "bg-emerald-100 text-emerald-700",
  low: "bg-blue-100 text-blue-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

export default function ModerationQueue({ modLogs, setModLogs }) {
  const [filter, setFilter] = useState("pending"); // pending | all

  const displayed = filter === "pending"
    ? modLogs.filter(l => !l.admin_reviewed)
    : modLogs;

  async function approve(log) {
    await base44.entities.ModerationLog.update(log.id, { admin_reviewed: true, admin_decision: "approved" });
    await base44.entities.Listing.update(log.listing_id, { status: "active" });
    setModLogs(p => p.map(l => l.id === log.id ? { ...l, admin_reviewed: true, admin_decision: "approved" } : l));
  }

  async function remove(log) {
    await base44.entities.ModerationLog.update(log.id, { admin_reviewed: true, admin_decision: "removed" });
    await base44.entities.Listing.update(log.listing_id, { status: "flagged" });
    setModLogs(p => p.map(l => l.id === log.id ? { ...l, admin_reviewed: true, admin_decision: "removed" } : l));
  }

  const pending = modLogs.filter(l => !l.admin_reviewed).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 p-3 rounded-2xl bg-violet-50 border border-violet-200">
        <Bot className="w-5 h-5 text-violet-600 shrink-0" />
        <div className="flex-1">
          <p className="text-xs font-bold text-violet-800">AI Moderation Active</p>
          <p className="text-[10px] text-violet-600">{pending} items pending review</p>
        </div>
        {pending > 0 && (
          <span className="bg-violet-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{pending}</span>
        )}
      </div>

      <div className="flex gap-2">
        {["pending", "all"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-smooth ${filter === f ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}
          >
            {f === "pending" ? `Pending (${pending})` : `All (${modLogs.length})`}
          </button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-foreground">Queue is clear!</p>
          <p className="text-xs text-muted-foreground mt-1">All items have been reviewed</p>
        </div>
      ) : displayed.map((log, i) => (
        <motion.div key={log.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
          className="bg-card rounded-xl p-3 border border-border/50 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{log.listing_title || "Untitled"}</p>
              <p className="text-[10px] text-muted-foreground">{log.poster_email}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${RISK_COLORS[log.risk_level] || "bg-gray-100 text-gray-700"}`}>
                {log.risk_level} ({log.risk_score})
              </span>
              {!log.admin_reviewed
                ? <Clock className="w-3.5 h-3.5 text-amber-500" />
                : log.admin_decision === "approved"
                  ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  : <XCircle className="w-3.5 h-3.5 text-red-500" />
              }
            </div>
          </div>

          {log.flags?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {log.flags.map(f => (
                <span key={f} className="text-[9px] px-1.5 py-0.5 rounded-md bg-red-50 text-red-700 font-medium">{f}</span>
              ))}
            </div>
          )}

          {log.explanation && (
            <p className="text-[10px] text-muted-foreground leading-relaxed bg-secondary/50 rounded-lg px-2.5 py-1.5">{log.explanation}</p>
          )}

          {!log.admin_reviewed && (
            <div className="flex gap-2 pt-1">
              <button onClick={() => approve(log)}
                className="flex-1 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-emerald-200">
                <CheckCircle className="w-3 h-3" /> Approve
              </button>
              <button onClick={() => remove(log)}
                className="flex-1 py-1.5 rounded-lg bg-red-100 text-red-700 text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-red-200">
                <XCircle className="w-3 h-3" /> Remove
              </button>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}