import { getTrustLevel, getMemberTenureBadge } from '@/lib/trustScoring';
import { CheckCircle2 } from 'lucide-react';

/**
 * Compact reputation badge showing trust score and level
 */
export default function ReputationBadge({ reputation, size = 'sm' }) {
  if (!reputation) return null;

  const score = reputation.reputation_score || 50;
  const level = getTrustLevel(score);
  const tenureBadge = getMemberTenureBadge(reputation.member_since);

  const sizeClasses = {
    xs: 'text-xs px-2 py-1',
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2'
  };

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full bg-secondary/60 ${sizeClasses[size]}`}>
      {score >= 80 && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
      <span className={`font-bold ${level.color}`}>{score}</span>
      {tenureBadge && <span className="text-xs">{tenureBadge.emoji}</span>}
    </div>
  );
}