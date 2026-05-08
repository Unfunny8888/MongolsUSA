import { CheckCircle2, Zap, Award } from 'lucide-react';

/**
 * Display verification badges and trust indicators
 */
export default function VerificationBadge({ verification, reputation, size = 'sm' }) {
  if (!verification && !reputation) return null;

  const verifiedCount = verification ? Object.values(verification).filter(v => v === true).length : 0;
  const trustScore = reputation?.reputation_score || 0;
  const isActive = reputation?.is_active ?? true;

  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };
  const sizeClass = sizeClasses[size] || sizeClasses.sm;

  return (
    <div className="flex items-center gap-1.5">
      {/* Email verified */}
      {verification?.email_verified && (
        <div title="Email verified" className="relative">
          <CheckCircle2 className={`${sizeClass} text-emerald-600 dark:text-emerald-400`} />
        </div>
      )}

      {/* Phone verified */}
      {verification?.phone_verified && (
        <div title="Phone verified" className="relative">
          <CheckCircle2 className={`${sizeClass} text-blue-600 dark:text-blue-400`} />
        </div>
      )}

      {/* ID verified */}
      {verification?.id_verified && (
        <div title="Identity verified" className="relative">
          <Award className={`${sizeClass} text-purple-600 dark:text-purple-400`} />
        </div>
      )}

      {/* Active user indicator */}
      {isActive && reputation?.last_activity && (
        <div title="Active member" className="relative">
          <Zap className={`${sizeClass} text-amber-500 dark:text-amber-400`} />
        </div>
      )}

      {/* Trust score indicator */}
      {trustScore >= 80 && (
        <div 
          title={`Trust score: ${trustScore}`}
          className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-xs font-bold"
        >
          ✓
        </div>
      )}
    </div>
  );
}