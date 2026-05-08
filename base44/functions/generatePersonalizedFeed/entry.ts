import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    let { language, city, interests } = body;

    // Fallback to user's profile data if not provided
    if (!city) city = user.city || 'Ulaanbaatar';
    if (!language) language = user.language || 'en';
    if (!interests || !Array.isArray(interests) || interests.length === 0) {
      interests = user.interests || ['cars', 'jobs', 'housing', 'services', 'events'];
    }

    // Fetch relevant listings based on interests and location
    const listings = await base44.entities.Listing.filter(
      {
        status: 'active',
        location_city: city,
        category: { $in: interests },
      },
      '-created_date',
      50
    );

    // Fetch relevant groups based on interests and city
    const groups = await base44.entities.Group.filter(
      {
        city: city,
        category: { $in: interests },
      },
      '-member_count',
      15
    );

    // Fetch relevant businesses based on interests and city
    const businesses = await base44.entities.Business.filter(
      {
        city: city,
      },
      '-rating',
      10
    );

    // Generate AI recommendations using the invoked LLM
    const interestLabels = Array.isArray(interests) ? interests.join(', ') : 'general items';
    const listingSummaries = listings.slice(0, 10).map(l =>
      `- ${l.title} (${l.category}) - $${l.price || 'Contact'}`
    ).join('\n');

    const aiRecommendations = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a personalization engine for NomadLink, a Mongolian community marketplace.

User Profile:
- Language: ${language}
- City: ${city}
- Interests: ${interestLabels}

Top Listings:
${listingSummaries}

Generate a brief, welcoming personalization message (1-2 sentences) for this user's feed based on their interests and location. Be warm and encouraging.`,
      response_json_schema: {
        type: 'object',
        properties: {
          welcome_message: { type: 'string' },
          featured_categories: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    // Store personalization data on user
    await base44.auth.updateMe({
      personalized_feed_generated: true,
      feed_recommendations: {
        listings: listings.map(l => l.id),
        groups: groups.map(g => g.id),
        businesses: businesses.map(b => b.id),
        welcome_message: aiRecommendations.welcome_message,
        featured_categories: aiRecommendations.featured_categories,
      },
    });

    return Response.json({
      success: true,
      listings: listings.length,
      groups: groups.length,
      businesses: businesses.length,
      welcome_message: aiRecommendations.welcome_message,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});