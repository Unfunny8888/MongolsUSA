import { useState } from "react";
import { Users, Phone, Mail, Clock } from "lucide-react";
import { motion } from "framer-motion";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function LeadTracker({ leads }) {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? leads : leads.filter(l => l.status === filter);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold">Leads ({leads.length})</span>
        </div>
        <div className="flex gap-1.5">
          {["all", "new", "contacted", "converted"].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold capitalize transition-colors ${
                filter === s ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-xs text-muted-foreground">No {filter === "all" ? "" : filter} leads yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((lead, i) => (
            <motion.div
              key={lead.id || i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-card rounded-xl border border-border/50 p-3 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg shrink-0">
                {lead.avatar || "👤"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{lead.name}</p>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  {lead.phone && <span className="flex items-center gap-0.5"><Phone className="w-3 h-3" />{lead.phone}</span>}
                  {lead.email && <span className="flex items-center gap-0.5"><Mail className="w-3 h-3" />{lead.email}</span>}
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                  lead.status === "new" ? "bg-blue-50 text-blue-600" :
                  lead.status === "contacted" ? "bg-amber-50 text-amber-600" :
                  "bg-emerald-50 text-emerald-600"
                }`}>{lead.status}</span>
                <p className="text-[9px] text-muted-foreground mt-0.5 flex items-center gap-0.5 justify-end">
                  <Clock className="w-2.5 h-2.5" />{timeAgo(lead.date)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}