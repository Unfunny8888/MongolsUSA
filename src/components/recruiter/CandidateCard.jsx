import { MapPin, Briefcase, DollarSign, Clock, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function CandidateCard({ candidate, matchScore, matchReason, onSelect, index }) {
  const r = candidate;
  const scoreColor = matchScore >= 80 ? "text-emerald-600 bg-emerald-50" :
    matchScore >= 60 ? "text-amber-600 bg-amber-50" :
    matchScore >= 40 ? "text-orange-600 bg-orange-50" : "text-red-500 bg-red-50";

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index || 0) * 0.04 }}
      onClick={() => onSelect?.(r)}
      className="w-full bg-card rounded-xl border border-border/50 p-3.5 text-left hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-lg shrink-0 overflow-hidden">
          {r.avatar ? <img src={r.avatar} alt={r.full_name} className="w-full h-full object-cover" /> : "👤"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold truncate">{r.full_name}</p>
            {matchScore !== undefined && (
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${scoreColor}`}>
                {matchScore}%
              </span>
            )}
          </div>
          <p className="text-xs text-primary font-medium truncate">{r.title || "Job Seeker"}</p>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5 text-[10px] text-muted-foreground">
            {r.location && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{r.location}</span>}
            {r.experience_years > 0 && <span className="flex items-center gap-0.5"><Briefcase className="w-3 h-3" />{r.experience_years}yr exp</span>}
            {r.salary_expectation > 0 && <span className="flex items-center gap-0.5"><DollarSign className="w-3 h-3" />${(r.salary_expectation / 1000).toFixed(0)}k</span>}
            {r.availability && <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{r.availability.replace('_', ' ')}</span>}
          </div>
          {(r.skills || []).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {r.skills.slice(0, 5).map(s => (
                <span key={s} className="text-[9px] font-semibold bg-secondary px-1.5 py-0.5 rounded">{s}</span>
              ))}
              {r.skills.length > 5 && <span className="text-[9px] text-muted-foreground">+{r.skills.length - 5}</span>}
            </div>
          )}
          {matchReason && <p className="text-[10px] text-muted-foreground mt-1.5 italic">"{matchReason}"</p>}
        </div>
      </div>
    </motion.button>
  );
}