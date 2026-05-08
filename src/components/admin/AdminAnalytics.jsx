import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

function StatBlock({ label, value, sub, color = "text-primary" }) {
  return (
    <div className="bg-card rounded-xl p-3.5 border border-border/50">
      <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
      <p className="text-xs font-semibold text-foreground mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

export default function AdminAnalytics({ listings, users, reports, modLogs }) {
  // Listings by category
  const catCounts = listings.reduce((acc, l) => {
    acc[l.category] = (acc[l.category] || 0) + 1;
    return acc;
  }, {});
  const catData = Object.entries(catCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  // Listings per day (last 7 days)
  const now = Date.now();
  const dayData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now - (6 - i) * 86400000);
    const label = d.toLocaleDateString("en", { weekday: "short" });
    const count = listings.filter(l => {
      const created = new Date(l.created_date).getTime();
      return created >= d.setHours(0, 0, 0, 0) && created < d.setHours(23, 59, 59, 999);
    }).length;
    return { day: label, count };
  });

  const flaggedRate = listings.length > 0
    ? ((modLogs.filter(m => m.risk_level === "high" || m.risk_level === "critical").length / listings.length) * 100).toFixed(1)
    : 0;

  const reportResolutionRate = reports.length > 0
    ? (((reports.filter(r => r.status !== "pending").length) / reports.length) * 100).toFixed(0)
    : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatBlock label="Total Listings" value={listings.length} sub="All time" />
        <StatBlock label="Total Users" value={users.length} sub="Registered" color="text-blue-600" />
        <StatBlock label="High-Risk Items" value={modLogs.filter(m => m.risk_level === "high" || m.risk_level === "critical").length} sub={`${flaggedRate}% of listings`} color="text-red-600" />
        <StatBlock label="Reports Resolved" value={`${reportResolutionRate}%`} sub={`${reports.filter(r => r.status !== "pending").length}/${reports.length}`} color="text-emerald-600" />
      </div>

      {/* Listings per day */}
      <div className="bg-card border border-border/50 rounded-xl p-4">
        <h4 className="text-xs font-bold mb-3">New Listings (Last 7 Days)</h4>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={dayData}>
            <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Category breakdown */}
      {catData.length > 0 && (
        <div className="bg-card border border-border/50 rounded-xl p-4">
          <h4 className="text-xs font-bold mb-3">Listings by Category</h4>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={catData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={70} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Bar dataKey="value" radius={4}>
                {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Moderation breakdown */}
      <div className="bg-card border border-border/50 rounded-xl p-4">
        <h4 className="text-xs font-bold mb-3">Moderation Overview</h4>
        <div className="space-y-2">
          {[
            { label: "AI Reviewed", value: modLogs.length, color: "bg-violet-400" },
            { label: "Admin Approved", value: modLogs.filter(m => m.admin_decision === "approved").length, color: "bg-emerald-400" },
            { label: "Admin Removed", value: modLogs.filter(m => m.admin_decision === "removed").length, color: "bg-red-400" },
            { label: "Pending Review", value: modLogs.filter(m => !m.admin_reviewed).length, color: "bg-amber-400" },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${item.color} shrink-0`} />
              <span className="text-xs text-muted-foreground flex-1">{item.label}</span>
              <span className="text-xs font-bold">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}