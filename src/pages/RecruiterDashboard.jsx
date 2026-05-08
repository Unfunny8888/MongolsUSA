import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Briefcase, Loader2, Sparkles, Search } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import ResumeDatabase from "../components/recruiter/ResumeDatabase";
import ApplicantPipeline from "../components/recruiter/ApplicantPipeline";
import HiringAnalytics from "../components/recruiter/HiringAnalytics";
import CandidateCard from "../components/recruiter/CandidateCard";

const TABS = ["Pipeline", "Resumes", "AI Match", "Analytics"];

export default function RecruiterDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("Pipeline");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resumes, setResumes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [aiMatches, setAiMatches] = useState([]);
  const [matching, setMatching] = useState(false);

  useEffect(() => {
    async function load() {
      const me = await base44.auth.me();
      setUser(me);

      const [allResumes, myJobs, myApps] = await Promise.all([
        base44.entities.Resume.filter({ is_active: true }, "-created_date", 100),
        base44.entities.Listing.filter({ created_by: me.email, category: "jobs" }, "-created_date", 50),
        base44.entities.JobApplication.filter({ recruiter_email: me.email }, "-created_date", 200),
      ]);

      setResumes(allResumes);
      setJobs(myJobs);
      setApplications(myApps);
      if (myJobs.length > 0) setSelectedJob(myJobs[0]);
      setLoading(false);
    }
    load();
  }, []);

  async function refreshApplications() {
    if (!user) return;
    const apps = await base44.entities.JobApplication.filter({ recruiter_email: user.email }, "-created_date", 200);
    setApplications(apps);
  }

  async function runAIMatch() {
    if (!selectedJob) return;
    setMatching(true);
    setAiMatches([]);
    const res = await base44.functions.invoke("matchCandidates", { job_listing_id: selectedJob.id });
    setAiMatches(res.data?.matches || []);
    setMatching(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh pb-24">
      {/* Header */}
      <div className="glass sticky top-0 z-40 border-b border-border/30">
        <div className="flex gap-1 px-4 py-2 overflow-x-auto no-scrollbar">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                tab === t ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        {tab === "Pipeline" && (
          <ApplicantPipeline applications={applications} onUpdate={refreshApplications} />
        )}

        {tab === "Resumes" && (
          <ResumeDatabase resumes={resumes} loading={false} onSelectCandidate={c => navigate(`/profile?email=${c.user_email}`)} />
        )}

        {tab === "AI Match" && (
          <div className="space-y-4">
            {/* Job Selector */}
            <div className="space-y-2">
              <p className="text-xs font-bold">Select a Job to Match</p>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {jobs.map(j => (
                  <button
                    key={j.id}
                    onClick={() => setSelectedJob(j)}
                    className={`shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      selectedJob?.id === j.id ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {j.title}
                  </button>
                ))}
              </div>
              {jobs.length === 0 && (
                <p className="text-xs text-muted-foreground">Post a job listing first to use AI matching.</p>
              )}
            </div>

            {selectedJob && (
              <Button
                onClick={runAIMatch}
                disabled={matching}
                className="w-full rounded-xl gap-2"
              >
                {matching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {matching ? "Matching candidates..." : `Find Best Candidates for "${selectedJob.title}"`}
              </Button>
            )}

            {aiMatches.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold">Top Matches</p>
                {aiMatches.map((m, i) => (
                  <CandidateCard
                    key={m.resume?.id || i}
                    candidate={m.resume}
                    matchScore={m.score}
                    matchReason={m.reason}
                    index={i}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "Analytics" && (
          <HiringAnalytics applications={applications} jobs={jobs} />
        )}
      </div>
    </div>
  );
}