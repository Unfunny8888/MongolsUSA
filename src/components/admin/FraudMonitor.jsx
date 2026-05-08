import { useState } from "react";
import { AlertTriangle, Zap, TrendingUp, Eye, Flag, User } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";

export default function FraudMonitor({ listings, reports, bans }) {
  const [scanning, setScanning] = useState(false);
  const [aiResults, setAiResults] = useState(null);

  // Derive fraud signals from data
  const duplicateTitles = listings.reduce((acc, l) => {
    acc[l.title] = (acc[l.title] || 0) + 1;
    return acc;
  }, {});
  const suspicious = listings.filter(l => duplicateTitles[l.title] > 1 || (l.price && l.price < 10 && l.category === "cars"));

  // Users with multiple reports
  const reportCounts = reports.reduce((acc, r) => {
    if (r.target_type === "user") acc[r.target_id] = (acc[r.target_id] || 0) + 1;
    return acc;
  }, {});
  const flaggedUsers = Object.entries(reportCounts).filter(([, count]) => count >= 2).map(([email, count]) => ({ email, count }));

  async function runAiScan() {
    setScanning(true);
    const summary = listings.slice(0, 30).map(l => `[${l.id}] "${l.title}" $${l.price || 0} ${l.category} by ${l.poster_name || "unknown"}`).join("\n");
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a fraud detection AI for a marketplace. Analyze these listings and identify potential scams, fraud patterns, or suspicious activity:\n\n${summary}\n\nLook for: unrealistic prices, duplicate patterns, scam keywords, suspicious categories. Return JSON.`,
      response_json_schema: {
        type: "object",
        properties: {
          risk_summary: { type: "string" },
          suspicious_ids: { type: "array", items: { type: "string" } },
          patterns_found: { type: "array", items: { type: "string" } },
          overall_risk: { type: "string", enum: ["low", "medium", "high"] }
        }
      }
    });
    setAiResults(result);
    setScanning(false);
  }

  const riskColor = { low: "text-emerald-600 bg-emerald-50", medium: "text-amber-600 bg-amber-50", high: "text-red-600 bg-red-50" };

  return (
    <div className="space-y-4">
      {/* AI Scan CTA */}
      <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-4 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-5 h-5" />
          <h3 className="text-sm font-bold">AI Fraud Detection</h3>
        </div>
        <p className="text-xs opacity-80 mb-3">Scan recent listings for scams, fake posts, and suspicious patterns.</p>
        <button
          onClick={runAiScan}
          disabled={scanning}
          className="w-full py-2 rounded-xl bg-white/20 text-white text-xs font-bold hover:bg-white/30 transition-smooth disabled:opacity-50"
        >
          {scanning ? "Scanning..." : "Run AI Scan"}
        </button>
      </div>

      {aiResults && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border/50 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold">AI Scan Results</h4>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${riskColor[aiResults.overall_risk] || "bg-gray-100"}`}>
              {aiResults.overall_risk} risk
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{aiResults.risk_summary}</p>
          {aiResults.patterns_found?.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold mb-1.5">Patterns detected:</p>
              <div className="flex flex-wrap gap-1.5">
                {aiResults.patterns_found.map((p, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-lg bg-orange-50 text-orange-700 border border-orange-200">{p}</span>
                ))}
              </div>
            </div>
          )}
          {aiResults.suspicious_ids?.length > 0 && (
            <p className="text-[10px] text-muted-foreground">{aiResults.suspicious_ids.length} listings flagged for review</p>
          )}
        </motion.div>
      )}

      {/* Duplicate listings */}
      {suspicious.length > 0 && (
        <div className="bg-card border border-amber-200 rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h4 className="text-xs font-bold text-amber-800">{suspicious.length} Suspicious Listings</h4>
          </div>
          {suspicious.slice(0, 5).map(l => (
            <div key={l.id} className="flex items-center gap-2 text-xs">
              <span className="flex-1 truncate text-muted-foreground">{l.title}</span>
              <span className="text-amber-600 font-semibold shrink-0">
                {duplicateTitles[l.title] > 1 ? "Duplicate" : "Price anomaly"}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Flagged users */}
      {flaggedUsers.length > 0 && (
        <div className="bg-card border border-red-200 rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-red-500" />
            <h4 className="text-xs font-bold text-red-800">Multi-Reported Users</h4>
          </div>
          {flaggedUsers.map(({ email, count }) => (
            <div key={email} className="flex items-center gap-2 text-xs">
              <span className="flex-1 truncate text-muted-foreground">{email}</span>
              <span className="bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-md">{count} reports</span>
            </div>
          ))}
        </div>
      )}

      {/* Active bans */}
      <div className="bg-card border border-border/50 rounded-xl p-3">
        <h4 className="text-xs font-bold mb-2">Active Bans ({bans.filter(b => b.is_active).length})</h4>
        {bans.filter(b => b.is_active).length === 0 ? (
          <p className="text-xs text-muted-foreground">No active bans</p>
        ) : bans.filter(b => b.is_active).map(ban => (
          <div key={ban.id} className="flex items-center gap-2 py-1.5 border-b border-border/30 last:border-0">
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${ban.ban_type === "shadow" ? "bg-gray-200 text-gray-700" : "bg-red-100 text-red-700"}`}>
              {ban.ban_type}
            </span>
            <span className="flex-1 text-xs truncate">{ban.user_email}</span>
            <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">{ban.reason}</span>
          </div>
        ))}
      </div>
    </div>
  );
}