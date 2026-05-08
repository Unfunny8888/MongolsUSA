import { useState } from "react";
import { ShieldAlert, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";

const LEVEL_COLORS = {
  safe: "text-emerald-600",
  low: "text-yellow-500",
  medium: "text-orange-500",
  high: "text-red-500",
  critical: "text-red-700",
};

export default function SpamFlagButton({ listingId }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function check() {
    setLoading(true);
    const res = await base44.functions.invoke("spamDetect", { listing_id: listingId });
    setResult(res.data);
    setLoading(false);
    setOpen(true);
  }

  return (
    <div>
      <button
        onClick={check}
        disabled={loading}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-smooth"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldAlert className="w-3.5 h-3.5" />}
        {loading ? "Checking..." : "Check listing safety"}
      </button>

      {open && result && (
        <div className="mt-2 p-3 rounded-xl bg-secondary/60 border border-border/50 text-xs space-y-1.5">
          <div className="flex items-center gap-2">
            {result.risk_level === "safe" || result.risk_level === "low" ? (
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-orange-500" />
            )}
            <span className={`font-bold capitalize ${LEVEL_COLORS[result.risk_level] || "text-foreground"}`}>
              {result.risk_level} risk ({result.risk_score}/100)
            </span>
          </div>
          <p className="text-muted-foreground leading-relaxed">{result.explanation}</p>
          {result.flags?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {result.flags.map((f, i) => (
                <span key={i} className="px-2 py-0.5 rounded-lg bg-orange-100 text-orange-700 text-[10px] font-medium">{f}</span>
              ))}
            </div>
          )}
          <button onClick={() => setOpen(false)} className="text-[10px] text-muted-foreground hover:text-foreground">Dismiss</button>
        </div>
      )}
    </div>
  );
}