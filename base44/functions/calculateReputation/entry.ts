import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Score weights (total = 100)
const WEIGHTS = {
  accountAge: 15,       // max 15pts — older = more trust
  listings: 10,         // max 10pts — active seller
  reviews: 20,          // max 20pts — avg rating * volume
  responseRate: 15,     // max 15pts — replies to messages
  communityActivity: 10,// max 10pts — posts, groups
  sales: 20,            // max 20pts — completed/sold listings
  reports: -10,         // penalty per spam/flag
};

function rankFromScore(score) {
  if (score >= 80) return "elite";
  if (score >= 60) return "gold";
  if (score >= 35) return "silver";
  return "bronze";
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const targetEmail = user.role === 'admin'
      ? (await req.json().catch(() => ({})))?.user_email || user.email
      : user.email;

    // Fetch all signals in parallel
    const [listings, reviews, messages, posts, groups, userRecord] = await Promise.all([
      base44.asServiceRole.entities.Listing.filter({ poster_email: targetEmail }),
      base44.asServiceRole.entities.Review.filter({ reviewer_email: targetEmail }),
      base44.asServiceRole.entities.Message.filter({ from_user: targetEmail }, '-created_date', 200),
      base44.asServiceRole.entities.Post.filter({ author_email: targetEmail }),
      base44.asServiceRole.entities.SavedListing.filter({ user_email: targetEmail }),
      base44.asServiceRole.entities.User.filter({ email: targetEmail }),
    ]);

    const profile = userRecord[0] || {};
    let breakdown = {};

    // 1. Account Age (max 15)
    const createdAt = profile.created_date ? new Date(profile.created_date) : new Date();
    const ageMonths = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30));
    breakdown.accountAge = Math.min(15, Math.floor(ageMonths / 2)); // 1pt per 2 months, cap 15

    // 2. Listings (max 10)
    const activeListings = listings.filter(l => l.status === 'active' || l.status === 'sold');
    breakdown.listings = Math.min(10, activeListings.length * 2);

    // 3. Reviews (max 20)
    if (reviews.length === 0) {
      breakdown.reviews = 0;
    } else {
      const avg = reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length;
      const volumeBonus = Math.min(5, reviews.length);
      breakdown.reviews = Math.min(20, Math.floor((avg / 5) * 15) + volumeBonus);
    }

    // 4. Response Rate (max 15)
    const replied = profile.messages_replied || 0;
    const received = profile.messages_received || 0;
    const responseRate = received > 0 ? Math.round((replied / received) * 100) : 0;
    breakdown.responseRate = Math.min(15, Math.floor(responseRate / 100 * 15));

    // 5. Community Activity (max 10)
    const groupCount = (profile.joined_groups || []).length;
    breakdown.communityActivity = Math.min(10, posts.length * 1 + groupCount * 2);

    // 6. Successful Sales (max 20)
    const soldListings = listings.filter(l => l.status === 'sold');
    breakdown.sales = Math.min(20, soldListings.length * 4);

    // 7. Reports Penalty
    const flaggedListings = listings.filter(l => l.status === 'flagged');
    breakdown.reports = Math.max(-20, -(flaggedListings.length * 5));

    // Verification bonuses
    let verificationBonus = 0;
    if (profile.email_verified) verificationBonus += 5;
    if (profile.phone_verified) verificationBonus += 5;
    if (profile.trusted_seller) verificationBonus += 5;
    if (profile.verified_business) verificationBonus += 5;
    if (profile.recruiter_verified) verificationBonus += 5;

    const rawScore = Object.values(breakdown).reduce((a, b) => a + b, 0) + verificationBonus;
    const trustScore = Math.max(0, Math.min(100, rawScore));
    const rank = rankFromScore(trustScore);

    // Update user
    const users = await base44.asServiceRole.entities.User.filter({ email: targetEmail });
    if (users[0]) {
      await base44.asServiceRole.entities.User.update(users[0].id, {
        trust_score: trustScore,
        reputation_score: trustScore,
        reputation_rank: rank,
        response_rate: responseRate,
        listing_count: activeListings.length,
      });
    }

    return Response.json({
      trust_score: trustScore,
      rank,
      response_rate: responseRate,
      breakdown: { ...breakdown, verificationBonus },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});