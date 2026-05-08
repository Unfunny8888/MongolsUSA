import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, Clock, CheckCircle } from "lucide-react";

const STAGE_COLORS = {
  applied: "#3b82f6",
  screening: "#6366f1",
  interview: "#f59e0b",
  offer: "#10b981",
  hired: "#16a34a",
  rejected: "#ef4444",
};

export default function HiringAnalytics({ applications, jobs }) {
  // Pipeline funnel
  const stages = ["applied", "screening", "interview", "offer", "hired", "rejected"];
  const funnelData = stages.map(s => ({
    stage: s.charAt(0).toUpperCase() + s.slice(1),
    count: applications.filter(a => a.stage === s).length,
  }));

  // Pie: applications per job
  const jobMap = {};
  applications.forEach(a => {
    const title = a.job_title || "Unknown";
    jobMap[title] = (jobMap[title] || 0) + 1;
  });
  const pieData = Object.entries(jobMap).map(([name, value]) => ({ name, value }));
  const PIE_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#6366f1", "#ef4444", "#8b5cf6"];

  // Summary stats
  const totalApps = applications.length;
  const hired = applications.filter(a => a.stage === "hired").length;
  const avgMatchScore = applications.filter(a => a.match_score > 0).length > 0
    ? Math.round(applications.filter(a => a.match_score > 0).reduce((s, a) => s + a.match_score, 0) / applications.filter(a => a.match_score > 0).length)
    : 0;
  const activeJobs = jobs.filter(j => j.status === "active").length;

  return (
    <div className="space-y-4">
      {/* Summary row */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: Users, label: "Total Applicants", value: totalApps, color: "text-blue-600", bg: "bg-blue-50" },
          { icon: CheckCircle, label: "Hired", value: hired, color: "text-green-600", bg: "bg-green-50" },
          { icon: TrendingUp, label: "Avg Match Score", value: `${avgMatchScore}%`, color: "text-purple-600", bg: "bg-purple-50" },
          { icon: Clock, label: "Active Jobs", value: activeJobs, color: "text-amber-600", bg: "bg-amber-50" },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-2xl border border-border/50 p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <div className={`w-7 h-7 rounded-lg ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
              </div>
              <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wide">{s.label}</span>
            </div>
            <p className="text-xl font-extrabold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Pipeline Funnel Chart */}
      {funnelData.some(d => d.count > 0) && (
        <div className="bg-card rounded-2xl border border-border/50 p-4">
          <p className="text-xs font-bold mb-3">Hiring Pipeline</p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData}>
                <XAxis dataKey="stage" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {funnelData.map((entry, i) => (
                    <Cell key={i} fill={STAGE_COLORS[stages[i]] || "#94a3b8"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Pie: Apps per Job */}
      {pieData.length > 0 && (
        <div className="bg-card rounded-2xl border border-border/50 p-4">
          <p className="text-xs font-bold mb-3">Applications by Job</p>
          <div className="h-40 flex items-center">
            <ResponsiveContainer width="60%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={30} outerRadius={55} paddingAngle={3}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1">
              {pieData.slice(0, 5).map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-[10px] truncate flex-1">{d.name}</span>
                  <span className="text-[10px] font-bold">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}