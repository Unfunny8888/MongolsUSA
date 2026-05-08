import { useState } from "react";
import { ChevronRight, User, Calendar, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";

const STAGES = [
  { key: "applied", label: "Applied", color: "bg-blue-500" },
  { key: "screening", label: "Screening", color: "bg-indigo-500" },
  { key: "interview", label: "Interview", color: "bg-amber-500" },
  { key: "offer", label: "Offer", color: "bg-emerald-500" },
  { key: "hired", label: "Hired", color: "bg-green-600" },
  { key: "rejected", label: "Rejected", color: "bg-red-500" },
];

export default function ApplicantPipeline({ applications, onUpdate }) {
  const [selectedStage, setSelectedStage] = useState("applied");

  const stageCounts = STAGES.map(s => ({
    ...s,
    count: applications.filter(a => a.stage === s.key).length,
  }));

  const filtered = applications.filter(a => a.stage === selectedStage);

  async function moveToStage(appId, newStage) {
    await base44.entities.JobApplication.update(appId, { stage: newStage });
    onUpdate?.();
  }

  const currentIdx = STAGES.findIndex(s => s.key === selectedStage);
  const nextStage = currentIdx < STAGES.length - 2 ? STAGES[currentIdx + 1] : null;

  return (
    <div className="space-y-4">
      {/* Pipeline bar */}
      <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
        {stageCounts.map(s => (
          <button
            key={s.key}
            onClick={() => setSelectedStage(s.key)}
            className={`flex-1 min-w-[70px] rounded-xl p-2 text-center transition-all ${
              selectedStage === s.key ? "ring-2 ring-primary bg-card shadow-sm" : "bg-secondary/50"
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${s.color} mx-auto mb-1`} />
            <p className="text-[10px] font-bold">{s.count}</p>
            <p className="text-[9px] text-muted-foreground">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Applicants in stage */}
      {filtered.length === 0 ? (
        <div className="text-center py-10">
          <User className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">No applicants in {selectedStage} stage</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((app, i) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-card rounded-xl border border-border/50 p-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg shrink-0">👤</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{app.applicant_name || app.applicant_email}</p>
                  <p className="text-[10px] text-primary">{app.job_title}</p>
                  {app.match_score > 0 && (
                    <p className="text-[10px] text-muted-foreground">Match: {app.match_score}%</p>
                  )}
                </div>
                {app.match_score > 0 && (
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    app.match_score >= 70 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                  }`}>{app.match_score}%</span>
                )}
              </div>

              {app.notes && <p className="text-[10px] text-muted-foreground mt-2 italic">{app.notes}</p>}

              <div className="flex items-center gap-2 mt-2.5">
                {app.interview_date && (
                  <span className="text-[9px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <Calendar className="w-3 h-3" />
                    {new Date(app.interview_date).toLocaleDateString()}
                  </span>
                )}
                {nextStage && selectedStage !== "rejected" && (
                  <button
                    onClick={() => moveToStage(app.id, nextStage.key)}
                    className="ml-auto text-[10px] text-primary font-semibold flex items-center gap-0.5 hover:underline"
                  >
                    Move to {nextStage.label} <ChevronRight className="w-3 h-3" />
                  </button>
                )}
                {selectedStage !== "rejected" && selectedStage !== "hired" && (
                  <button
                    onClick={() => moveToStage(app.id, "rejected")}
                    className="text-[10px] text-destructive font-semibold hover:underline"
                  >
                    Reject
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}