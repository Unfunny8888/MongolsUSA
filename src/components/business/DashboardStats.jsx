import { Eye, Users, MessageSquare, Star, TrendingUp, DollarSign } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";

const STAT_CONFIG = [
  { key: "views", label: "Profile Views", icon: Eye, color: "text-blue-600", bg: "bg-blue-50" },
  { key: "leads", label: "Leads", icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
  { key: "messages", label: "Messages", icon: MessageSquare, color: "text-indigo-600", bg: "bg-indigo-50" },
  { key: "reviews", label: "Avg Rating", icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
  { key: "revenue", label: "Ad Spend", icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
  { key: "growth", label: "Growth", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
];

export default function DashboardStats({ stats, chartData }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {STAT_CONFIG.map(({ key, label, icon: Icon, color, bg }) => (
          <div key={key} className="bg-card rounded-2xl border border-border/50 p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
            </div>
            <p className="text-xl font-extrabold">{stats[key] ?? 0}{key === "reviews" ? "★" : key === "growth" ? "%" : ""}</p>
          </div>
        ))}
      </div>

      {chartData && chartData.length > 0 && (
        <div className="bg-card rounded-2xl border border-border/50 p-4">
          <p className="text-xs font-bold mb-3">Views This Week</p>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid hsl(var(--border))" }}
                  labelStyle={{ fontWeight: 700 }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#viewsGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}