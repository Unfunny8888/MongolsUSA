import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { listing_id } = await req.json();
    if (!listing_id) {
      return Response.json({ error: 'listing_id required' }, { status: 400 });
    }

    const listing = await base44.entities.Listing.get(listing_id);
    if (!listing) {
      return Response.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Check for duplicates
    const similar = await base44.entities.Listing.filter({ category: listing.category }, '-created_date', 50);
    const duplicates = similar.filter(l =>
      l.id !== listing.id &&
      l.title?.toLowerCase().trim() === listing.title?.toLowerCase().trim()
    );

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a spam and scam detection AI for a Mongolian community marketplace.
Analyze this listing for spam, scam, fake content, or policy violations.

Title: ${listing.title}
Description: ${listing.description}
Price: ${listing.price} (type: ${listing.price_type})
Category: ${listing.category}
Contact: phone=${listing.contact_phone}, email=${listing.contact_email}, telegram=${listing.contact_telegram}
Poster: ${listing.poster_name}
Duplicate count: ${duplicates.length} similar listings found

Red flags to check:
- Unrealistically low prices (e.g., luxury car for $500)
- Requests for wire transfer, gift cards, or crypto
- Vague descriptions with no real details
- Too-good-to-be-true offers
- Suspicious contact info (foreign numbers, suspicious emails)
- Duplicate or copy-paste content
- Fake or stock photo descriptions
- Requests to move conversation off-platform
- Job scams (work from home, make thousands fast)
- Housing scams (deposit before viewing)

Provide a risk score and explanation.`,
      response_json_schema: {
        type: "object",
        properties: {
          risk_score: { type: "number", description: "0-100, where 100 is definitely spam/scam" },
          risk_level: { type: "string", enum: ["safe", "low", "medium", "high", "critical"] },
          flags: { type: "array", items: { type: "string" } },
          recommendation: { type: "string", enum: ["approve", "review", "flag", "remove"] },
          explanation: { type: "string" }
        }
      }
    });

    // If high risk, auto-flag the listing
    if (result.risk_score >= 70 && user.role === 'admin') {
      await base44.asServiceRole.entities.Listing.update(listing_id, { status: 'flagged' });
    }

    return Response.json({
      listing_id,
      duplicate_count: duplicates.length,
      ...result
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});