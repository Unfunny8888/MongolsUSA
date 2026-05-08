import { useState } from "react";
import { Search, Filter, Loader2 } from "lucide-react";
import CandidateCard from "./CandidateCard";
import { Input } from "@/components/ui/input";

export default function ResumeDatabase({ resumes, loading, onSelectCandidate }) {
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("");

  const filtered = resumes.filter(r => {
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      (r.full_name || "").toLowerCase().includes(q) ||
      (r.title || "").toLowerCase().includes(q) ||
      (r.location || "").toLowerCase().includes(q) ||
      (r.skills || []).some(s => s.toLowerCase().includes(q));
    const matchesSkill = !skillFilter || (r.skills || []).some(s => s.toLowerCase().includes(skillFilter.toLowerCase()));
    return matchesSearch && matchesSkill;
  });

  // Collect all unique skills for quick filter
  const allSkills = [...new Set(resumes.flatMap(r => r.skills || []))].slice(0, 20);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, title, skill, location..."
          className="pl-9 rounded-xl h-10 text-sm"
        />
      </div>

      {allSkills.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSkillFilter("")}
            className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
              !skillFilter ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
            }`}
          >
            All
          </button>
          {allSkills.map(s => (
            <button
              key={s}
              onClick={() => setSkillFilter(skillFilter === s ? "" : s)}
              className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
                skillFilter === s ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10">
          <Filter className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">
            {resumes.length === 0 ? "No resumes in database yet" : "No candidates match your search"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((r, i) => (
            <CandidateCard key={r.id} candidate={r} index={i} onSelect={onSelectCandidate} />
          ))}
        </div>
      )}

      <p className="text-[10px] text-muted-foreground text-center">
        {filtered.length} of {resumes.length} candidates
      </p>
    </div>
  );
}