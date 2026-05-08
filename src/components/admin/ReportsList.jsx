import { useState } from "react";
import { Flag, CheckCircle, XCircle, AlertTriangle, User, FileText, Building, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";

const REASON_COLORS = {
  spam: "bg-orange-100 text-orange-700",
  scam: "bg-red-100 text-red-700",
  inappropriate: "bg-pink-100 text-pink-700",
  fake: "bg-amber-100 text-amber-700",
  harassment: "bg-purple-100 text-purple-700",
  other: "bg-gray-100 text-gray-700",
};

const TARGET_ICONS = {
  listing: FileText,
  user: User,
  post: MessageSquare,
  business: Building,
};

function timeAgo(d) {
  const diff = Date.now() - new Date(d).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return `${Math.floor(diff / 60000)}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function ReportsList({ reports, setReports }) {
  const [filter, setFilter] = useState("pending");

  const displayed = reports.filter(r => filter === "all" ? true : r.status === filter);

  async function action(report, status) {
    await base44.entities.Report.update(report.id, { status, reviewed_by: "admin" });
    setReports(p => p.map(r => r.id === report.id ? { ...r, status } : r));
  }

  const counts = { pending: reports.filter(r => r.status === "pending").length };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {["pending", "reviewed", "actioned", "dismissed", "all"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-smooth ${filter === f ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}
          >
            {f}{f === "pending" && counts.pending > 0 ? ` (${counts.pending})` : ""}
          </button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <div className="text-center py-12">
          <Flag className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No {filter} reports</p>
        </div>
      ) : displayed.map((report, i) => {
        const TargetIcon = TARGET_ICONS[report.target_type] || FileText;
        return (
          <motion.div key={report.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="bg-card rounded-xl p-3 border border-border/50 space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                <TargetIcon className="w-4 h-4 text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{report.target_title || report.target_id}</p>
                <p className="text-[10px] text-muted-foreground">Reported by {report.reporter_name || report.reporter_email} • {timeAgo(report.created_date)}</p>
              </div>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md shrink-0 ${REASON_COLORS[report.reason] || "bg-gray-100 text-gray-700"}`}>
                {report.reason}
              </span>
            </div>

            {report.description && (
              <p className="text-[10px] text-muted-foreground bg-secondary/50 rounded-lg px-2.5 py-1.5 leading-relaxed">"{report.description}"</p>
            )}

            <div className="flex items-center gap-1.5">
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                report.status === "pending" ? "bg-amber-100 text-amber-700" :
                report.status === "actioned" ? "bg-emerald-100 text-emerald-700" :
                report.status === "dismissed" ? "bg-gray-100 text-gray-700" :
                "bg-blue-100 text-blue-700"
              }`}>{report.status}</span>

              {report.status === "pending" && (
                <div className="flex gap-1.5 ml-auto">
                  <button onClick={() => action(report, "actioned")}
                    className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-[10px] font-bold hover:bg-emerald-200 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Action
                  </button>
                  <button onClick={() => action(report, "dismissed")}
                    className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-bold hover:bg-gray-200 flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Dismiss
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}