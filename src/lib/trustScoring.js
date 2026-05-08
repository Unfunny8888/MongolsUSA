/**
 * Calculate trust score from reputation data
 * Returns 0-100 score with breakdown
 */
export function calculateTrustScore(reputation, verification) {
  if (!reputation) return 0;

  let score = reputation.reputation_score || 50;

  // Boost for verification
  if (verification) {
    if (verification.email_verified) score += 5;
    if (verification.phone_verified) score += 10;
    if (verification.id_verified) score += 15;
    if (verification.address_verified) score += 10;
    if (verification.business_verified) score += 20;
  }

  // Boost for activity
  const activityBonus = Math.min(reputation.total_transactions * 2, 20);
  score += activityBonus;

  return Math.min(score, 100);
}

/**
 * Get trust level label
 */
export function getTrustLevel(score) {
  if (score >= 85) return { level: 'trusted', label: 'Highly Trusted', color: 'text-emerald-600 dark:text-emerald-400' };
  if (score >= 70) return { level: 'good', label: 'Good Standing', color: 'text-blue-600 dark:text-blue-400' };
  if (score >= 50) return { level: 'neutral', label: 'Active Member', color: 'text-slate-600 dark:text-slate-400' };
  if (score >= 30) return { level: 'caution', label: 'Caution', color: 'text-amber-600 dark:text-amber-400' };
  return { level: 'risky', label: 'High Risk', color: 'text-red-600 dark:text-red-400' };
}

/**
 * Get badge display info
 */
export const BADGE_INFO = {
  power_seller: { emoji: '⭐', label: 'Power Seller', color: 'emerald' },
  active_trader: { emoji: '🔥', label: 'Active Trader', color: 'orange' },
  helpful_community: { emoji: '💬', label: 'Helpful', color: 'blue' },
  trusted_buyer: { emoji: '✅', label: 'Trusted Buyer', color: 'emerald' },
  verified_pro: { emoji: '🏆', label: 'Verified Pro', color: 'purple' },
  quick_responder: { emoji: '⚡', label: 'Quick Responder', color: 'amber' },
  community_leader: { emoji: '👑', label: 'Community Leader', color: 'yellow' },
};

/**
 * Get member tenure badge
 */
export function getMemberTenureBadge(memberSinceDate) {
  if (!memberSinceDate) return null;
  const months = (Date.now() - new Date(memberSinceDate).getTime()) / (1000 * 60 * 60 * 24 * 30);
  if (months >= 24) return { emoji: '🎖️', label: '2+ years' };
  if (months >= 12) return { emoji: '📅', label: '1+ year' };
  if (months >= 6) return { emoji: '📆', label: '6+ months' };
  return null;
}

/**
 * Score response rate
 */
export function getResponseRateColor(rate) {
  if (rate >= 90) return 'text-emerald-600 dark:text-emerald-400';
  if (rate >= 75) return 'text-blue-600 dark:text-blue-400';
  if (rate >= 50) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}