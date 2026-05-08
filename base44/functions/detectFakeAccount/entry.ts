import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { user_email } = await req.json();

    // Service role check
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const userData = await base44.entities.User.filter({ email: user_email }, null, 1);
    if (!userData || userData.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const profile = userData[0];
    const riskScore = calculateRiskScore(profile);
    const flags = identifyRiskFlags(profile);

    return Response.json({
      user_email,
      risk_score: riskScore,
      is_suspicious: riskScore > 60,
      risk_level: riskScore > 75 ? 'high' : riskScore > 50 ? 'medium' : 'low',
      flags,
      recommendation: riskScore > 75 ? 'Consider manual review or suspension' : 'Monitor account',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function calculateRiskScore(profile) {
  let score = 0;

  // Missing profile info = higher risk
  if (!profile.email_verified) score += 20;
  if (!profile.full_name || profile.full_name.length < 3) score += 25;
  if (!profile.avatar) score += 10;
  if (!profile.bio || profile.bio.length < 10) score += 15;

  // New accounts with high activity = suspicious
  const createdDate = new Date(profile.created_date);
  const daysSinceCreation = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysSinceCreation < 1) {
    if ((profile.listing_count || 0) > 5) score += 30; // Too many listings too fast
    if ((profile.message_count || 0) > 20) score += 25; // Too many messages too fast
  }

  // Suspicious patterns
  if (profile.reputation_score && profile.reputation_score < -50) score += 35; // Negative reputation
  if (profile.reported_count && profile.reported_count > 3) score += 40; // Multiple reports
  if (!profile.phone_verified && daysSinceCreation > 7) score += 15; // Old account without phone

  // Username pattern (simple check for spam-like usernames)
  if (profile.username && /\d{4,}/.test(profile.username)) score += 10; // Too many consecutive digits

  return Math.min(score, 100);
}

function identifyRiskFlags(profile) {
  const flags = [];

  if (!profile.email_verified) flags.push('Email not verified');
  if (!profile.phone_verified) flags.push('Phone not verified');
  if (!profile.full_name || profile.full_name.length < 3) flags.push('Invalid full name');
  if (!profile.avatar) flags.push('No profile photo');
  if (!profile.bio || profile.bio.length < 10) flags.push('No bio or minimal bio');

  const createdDate = new Date(profile.created_date);
  const daysSinceCreation = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);

  if (daysSinceCreation < 1) {
    if ((profile.listing_count || 0) > 5) flags.push('High listing velocity');
    if ((profile.message_count || 0) > 20) flags.push('High message velocity');
  }

  if (profile.reputation_score && profile.reputation_score < -50) flags.push('Negative reputation');
  if (profile.reported_count && profile.reported_count > 3) flags.push('Multiple user reports');
  if (profile.username && /\d{4,}/.test(profile.username)) flags.push('Suspicious username pattern');

  return flags;
}