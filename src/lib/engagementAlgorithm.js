/**
 * Engagement scoring & ranking algorithm
 * Similar to Facebook/Threads/Telegram
 */

export function calculateEngagementScore(post) {
  if (!post) return 0;

  const likeWeight = 1;
  const commentWeight = 2;
  const repostWeight = 3;
  const recency = getRecencyScore(post.created_date);

  const baseScore = 
    (post.like_count || 0) * likeWeight +
    (post.comment_count || 0) * commentWeight +
    (post.repost_count || 0) * repostWeight;

  // Boost recent posts
  return baseScore * recency;
}

export function getRecencyScore(createdDate) {
  if (!createdDate) return 0.5;
  const ageHours = (Date.now() - new Date(createdDate).getTime()) / (1000 * 60 * 60);
  // Posts from last 24h: score 1.0, older: decay
  return Math.max(0.3, 1 - ageHours / 72);
}

export function rankPostsByEngagement(posts) {
  if (!Array.isArray(posts)) return [];
  return [...posts].sort((a, b) => calculateEngagementScore(b) - calculateEngagementScore(a));
}

export function calculateUserEngagementScore(reputation, presence) {
  if (!reputation) return 0;

  const activityScore = reputation.is_active ? 1.5 : 1;
  const reputationMultiplier = (reputation.reputation_score || 50) / 50;
  const transactionBonus = Math.min((reputation.total_transactions || 0) / 10, 2);

  return reputationMultiplier * activityScore * transactionBonus;
}

export function suggestUsers(allUsers, currentUserEmail, limit = 6) {
  if (!Array.isArray(allUsers)) return [];

  return allUsers
    .filter(u => u.user_email !== currentUserEmail)
    .sort((a, b) => calculateUserEngagementScore(b) - calculateUserEngagementScore(a))
    .slice(0, limit);
}

export function suggestGroups(allGroups, userJoinedGroups = [], limit = 6) {
  if (!Array.isArray(allGroups)) return [];

  const joinedIds = new Set(userJoinedGroups.map(g => g.id));

  return allGroups
    .filter(g => !joinedIds.has(g.id))
    .sort((a, b) => (b.member_count || 0) - (a.member_count || 0))
    .slice(0, limit);
}

export function getTrendingPosts(posts, timeWindowHours = 24) {
  if (!Array.isArray(posts)) return [];

  const cutoff = Date.now() - timeWindowHours * 60 * 60 * 1000;

  return posts
    .filter(p => new Date(p.created_date).getTime() > cutoff)
    .sort((a, b) => calculateEngagementScore(b) - calculateEngagementScore(a))
    .slice(0, 10);
}

export function getEngagementMetrics(post) {
  if (!post) return { totalEngagement: 0, engagementRate: 0 };

  const totalEngagement = (post.like_count || 0) + (post.comment_count || 0) + (post.repost_count || 0);
  
  return {
    totalEngagement,
    engagementScore: calculateEngagementScore(post),
    likes: post.like_count || 0,
    comments: post.comment_count || 0,
    reposts: post.repost_count || 0,
  };
}