import { ShieldCheck, Clock, MessageSquare, TrendingUp } from "lucide-react";
import VerificationBadge from "./VerificationBadge";

function trustLabel(score) {
  if (score >= 90) return { label: "Highly Trusted", color: "text-emerald-600", bar: "bg-emerald-500" };
  if (score >= 70) return { label: "Trusted", color: "text-blue-600", bar: "bg-blue-500" };
  if (score >= 50) return { label: "Good Standing", color: "text-amber-600", bar: "bg-amber-500" };
  return { label: "New Member", color: "text-muted-foreground", bar: "bg-muted-foreground/40" };
}

function accountAge(createdDate) {
  if (!createdDate) return "New";
  const months = Math.floor((Date.now() - new Date(createdDate).getTime()) / (1000 * 60 * 60 * 24 * 30));
  if (months < 1) return "< 1 month";
  if (months < 12) return `${months}mo`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${years}y ${rem}mo` : `${years}y`;
}

export default function TrustCard({ user }) {
  if (!user) return null;

  const score = user.trust_score || 0;
  const { label, color, bar } = trustLabel(score);
  const responseRate = user.response_rate ?? 0;
  const age = accountAge(user.created_date);
  const hasAnyVerification = ["phone_verified", "email_verified", "trusted_seller", "verified_business", "recruiter_verified"].some(k => user[k]);

  return (
    <div className="bg-card rounded-2xl border border-border/50 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-primary" />
        <span className="text-sm font-bold">Trust &amp; Verification</span>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className={`text-xs font-bold ${color}`}>{label}</span>
          <span className="text-xs font-extrabold text-foreground">{score}<span className="text-muted-foreground font-normal">/100</span></span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-700 ${bar}`} style={{ width: `${Math.min(score, 100)}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center bg-secondary/60 rounded-xl py-2.5 px-1">
          <Clock className="w-3.5 h-3.5 text-muted-foreground mb-1" />
          <span className="text-xs font-bold">{age}</span>
          <span className="text-[9px] text-muted-foreground mt-0.5">Account Age</span>
        </div>
        <div className="flex flex-col items-center bg-secondary/60 rounded-xl py-2.5 px-1">
          <MessageSquare className="w-3.5 h-3.5 text-muted-foreground mb-1" />
          <span className="text-xs font-bold">{responseRate}%</span>
          <span className="text-[9px] text-muted-foreground mt-0.5">Response Rate</span>
        </div>
        <div className="flex flex-col items-center bg-secondary/60 rounded-xl py-2.5 px-1">
          <TrendingUp className="w-3.5 h-3.5 text-muted-foreground mb-1" />
          <span className="text-xs font-bold">{user.listing_count || 0}</span>
          <span className="text-[9px] text-muted-foreground mt-0.5">Listings</span>
        </div>
      </div>

      {hasAnyVerification ? (
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Verified Credentials</p>
          <VerificationBadge user={user} />
        </div>
      ) : (
        <div className="text-center py-2">
          <p className="text-xs text-muted-foreground">No verifications yet</p>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5">Complete your profile to earn trust badges</p>
        </div>
      )}
    </div>
  );
}