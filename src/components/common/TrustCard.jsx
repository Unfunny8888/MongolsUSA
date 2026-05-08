import { useState } from 'react';
import { Shield, MessageCircle, Award, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { calculateTrustScore, getTrustLevel, BADGE_INFO, getMemberTenureBadge, getResponseRateColor } from '@/lib/trustScoring';
import VerificationBadge from './VerificationBadge';

/**
 * Trust card showing user reputation, verification, and trust signals
 */
export default function TrustCard({ user, reputation, verification, compact = false }) {
  const [showDetails, setShowDetails] = useState(false);

  if (!reputation) return null;

  const trustScore = calculateTrustScore(reputation, verification);
  const trustLevel = getTrustLevel(trustScore);
  const tenureBadge = getMemberTenureBadge(reputation.member_since);

  const scorePercentage = (trustScore / 100) * 100;

  if (compact) {
    return (
      <div className="flex items-center gap-2 p-2 bg-secondary/50 rounded-lg">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-foreground">Trust Score</span>
            <span className={`text-sm font-bold ${trustLevel.color}`}>{trustScore}/100</span>
          </div>
          <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                trustScore >= 80 ? 'bg-emerald-600' :
                trustScore >= 60 ? 'bg-blue-600' :
                trustScore >= 40 ? 'bg-amber-600' :
                'bg-red-600'
              }`}
              style={{ width: `${scorePercentage}%` }}
            />
          </div>
        </div>
        <VerificationBadge verification={verification} reputation={reputation} size="sm" />
      </div>
    );
  }

  return (
    <motion.div
      className="bg-card border border-border/40 rounded-2xl p-4 space-y-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">Trust &amp; Safety</h3>
          <p className={`text-xs font-semibold ${trustLevel.color}`}>{trustLevel.label}</p>
        </div>
        <VerificationBadge verification={verification} reputation={reputation} size="md" />
      </div>

      {/* Trust score bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-foreground">Trust Score</span>
          <span className={`text-lg font-bold ${trustLevel.color}`}>{trustScore}</span>
        </div>
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className={`h-full transition-all ${
              trustScore >= 80 ? 'bg-emerald-600 dark:bg-emerald-500' :
              trustScore >= 60 ? 'bg-blue-600 dark:bg-blue-500' :
              trustScore >= 40 ? 'bg-amber-600 dark:bg-amber-500' :
              'bg-red-600 dark:bg-red-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${scorePercentage}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2 bg-secondary/50 rounded-lg text-center">
          <p className="text-xs text-muted-foreground">Response</p>
          <p className={`text-sm font-bold ${getResponseRateColor(reputation.response_rate || 0)}`}>
            {Math.round(reputation.response_rate || 0)}%
          </p>
        </div>
        <div className="p-2 bg-secondary/50 rounded-lg text-center">
          <p className="text-xs text-muted-foreground">Transactions</p>
          <p className="text-sm font-bold text-foreground">{reputation.total_transactions || 0}</p>
        </div>
        <div className="p-2 bg-secondary/50 rounded-lg text-center">
          <p className="text-xs text-muted-foreground">Success</p>
          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            {reputation.total_transactions ? Math.round((reputation.successful_sales / reputation.total_transactions) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Badges */}
      {reputation.badges && reputation.badges.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-foreground">Earned Badges</p>
          <div className="flex flex-wrap gap-1.5">
            {reputation.badges.map(badge => {
              const info = BADGE_INFO[badge];
              return info ? (
                <div
                  key={badge}
                  title={info.label}
                  className="px-2 py-1 bg-secondary/60 rounded-full text-xs font-medium flex items-center gap-1"
                >
                  <span>{info.emoji}</span>
                  <span className="text-foreground">{info.label}</span>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Tenure */}
      {tenureBadge && (
        <div className="flex items-center gap-2 p-2 bg-secondary/40 rounded-lg">
          <span className="text-lg">{tenureBadge.emoji}</span>
          <span className="text-xs text-foreground">Member for {tenureBadge.label}</span>
        </div>
      )}

      {/* Activity status */}
      {reputation.is_active ? (
        <div className="flex items-center gap-2 p-2 bg-emerald-100 dark:bg-emerald-950/30 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Active now</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 p-2 bg-secondary/40 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-slate-400" />
          <span className="text-xs text-muted-foreground">
            Last seen {reputation.last_activity ? new Date(reputation.last_activity).toLocaleDateString() : 'Unknown'}
          </span>
        </div>
      )}

      {/* Details toggle */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full py-2 text-xs font-medium text-primary hover:underline"
      >
        {showDetails ? 'Hide' : 'Show'} Details
      </button>

      {/* Details */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-2 pt-2 border-t border-border/20"
        >
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Positive Feedback</span>
            <span className="font-semibold text-emerald-600">{reputation.positive_feedback || 0}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Negative Feedback</span>
            <span className="font-semibold text-red-600">{reputation.negative_feedback || 0}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Avg Response Time</span>
            <span className="font-semibold">{reputation.response_time_hours || 24}h</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Member Since</span>
            <span className="font-semibold">
              {reputation.member_since ? new Date(reputation.member_since).toLocaleDateString() : 'Unknown'}
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}