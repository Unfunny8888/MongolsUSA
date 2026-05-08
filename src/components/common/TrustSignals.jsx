import { Clock, MessageSquare, Calendar, CheckCircle2 } from 'lucide-react';
import { getTrustLevel, getResponseRateColor } from '@/lib/trustScoring';

/**
 * Trust signals row - shows response rate, joined date, and verification status
 */
export default function TrustSignals({ user, reputation, verification }) {
  if (!reputation) return null;

  const trustScore = reputation.reputation_score || 50;
  const trustLevel = getTrustLevel(trustScore);
  const responseRate = Math.round(reputation.response_rate || 0);
  const joinedDate = reputation.member_since ? new Date(reputation.member_since).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : null;

  return (
    <div className="flex items-center gap-3 flex-wrap text-xs">
      {/* Verification */}
      {verification?.email_verified && (
        <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-950/40 rounded-full text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="w-3 h-3" />
          <span className="font-medium">Verified</span>
        </div>
      )}

      {/* Response rate */}
      <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
        responseRate >= 90 ? 'bg-emerald-100 dark:bg-emerald-950/40' :
        responseRate >= 70 ? 'bg-blue-100 dark:bg-blue-950/40' :
        'bg-secondary/50'
      }`}>
        <MessageSquare className="w-3 h-3" />
        <span className="font-medium">{responseRate}% replies</span>
      </div>

      {/* Joined date */}
      {joinedDate && (
        <div className="flex items-center gap-1 px-2 py-1 bg-secondary/50 rounded-full text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span className="font-medium">Joined {joinedDate}</span>
        </div>
      )}

      {/* Trust level */}
      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-foreground font-bold ${
        trustScore >= 80 ? 'bg-emerald-100 dark:bg-emerald-950/40' :
        trustScore >= 60 ? 'bg-blue-100 dark:bg-blue-950/40' :
        'bg-secondary/50'
      }`}>
        <span>{trustLevel.label}</span>
      </div>
    </div>
  );
}