import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // Support both direct calls and entity automation payloads
    const listingId = body.listing_id || body.event?.entity_id || body.data?.id;
    if (!listingId) {
      return Response.json({ error: 'listing_id required' }, { status: 400 });
    }

    const listing = await base44.asServiceRole.entities.Listing.get(listingId);
    if (!listing) {
      return Response.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Skip already flagged/removed listings
    if (listing.status === 'flagged' || listing.status === 'removed') {
      return Response.json({ skipped: true, reason: 'Already moderated' });
    }

    // Check for duplicates (same title, same category, recent)
    const similar = await base44.asServiceRole.entities.Listing.filter({ category: listing.category }, '-created_date', 100);
    const titleNorm = listing.title?.toLowerCase().trim();
    const duplicates = similar.filter(l =>
      l.id !== listing.id &&
      l.created_by === listing.created_by &&
      l.title?.toLowerCase().trim() === titleNorm
    );

    // Check poster's recent listing count (spam velocity)
    const recentByUser = listing.created_by
      ? similar.filter(l => l.created_by === listing.created_by && l.id !== listing.id)
      : [];

    // AI analysis
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a strict content moderation AI for NomadLink, a Mongolian diaspora marketplace. Analyze this listing for policy violations.

Listing Details:
- Title: ${listing.title}
- Description: ${listing.description || "(empty)"}
- Category: ${listing.category}
- Price: $${listing.price || 0} (${listing.price_type || "fixed"})
- Location: ${listing.location_city || ""}, ${listing.location_state || ""}
- Contact: phone=${listing.contact_phone || ""}, email=${listing.contact_email || ""}, telegram=${listing.contact_telegram || ""}
- Poster: ${listing.poster_name || "Unknown"}
- Poster's total recent listings: ${recentByUser.length}
- Exact duplicate listings by same user: ${duplicates.length}
- Images uploaded: ${listing.images?.length || 0}

Detect ALL of the following:
1. SCAM indicators: unrealistic prices, requests for wire transfer/gift cards/crypto, advance fee fraud
2. SPAM: repetitive content, bulk posting (${recentByUser.length} recent listings from this user)
3. FAKE JOBS: "make $1000/week from home", multi-level marketing, requires upfront payment
4. OFFENSIVE CONTENT: hate speech, discrimination, explicit material
5. DUPLICATE LISTINGS: ${duplicates.length} exact duplicates found from same user
6. SUSPICIOUS BEHAVIOR: foreign contact numbers, suspicious email domains, requests to leave platform
7. HOUSING SCAMS: deposit before viewing, no address, too cheap for area
8. MISSING INFO: critical fields empty for the category

Return scores and actions needed.`,
      response_json_schema: {
        type: "object",
        properties: {
          risk_score: { type: "number" },
          risk_level: { type: "string" },
          flags: { type: "array", items: { type: "string" } },
          recommendation: { type: "string" },
          explanation: { type: "string" }
        }
      }
    });

    const actions_taken = [];

    // Apply automated actions based on risk score
    if (result.risk_score >= 80 || result.recommendation === "remove") {
      // Critical: auto-flag + remove from feed
      await base44.asServiceRole.entities.Listing.update(listingId, {
        status: 'flagged',
        is_featured: false,
        is_boosted: false,
      });
      actions_taken.push("auto_flagged", "visibility_removed");

      // Notify the poster if we have their email
      if (listing.created_by) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: listing.created_by,
          subject: "Your NomadLink listing has been flagged for review",
          body: `Hi ${listing.poster_name || "there"},\n\nYour listing "${listing.title}" has been flagged by our automated moderation system and is under review.\n\nReason: ${result.explanation}\n\nIf you believe this is a mistake, please contact our support team.\n\nNomadLink Team`
        });
        actions_taken.push("user_notified");
      }

    } else if (result.risk_score >= 50 || result.recommendation === "flag") {
      // High risk: flag for admin review but keep visible
      await base44.asServiceRole.entities.Listing.update(listingId, {
        status: 'flagged',
        is_boosted: false,
      });
      actions_taken.push("flagged_for_review", "boost_removed");

    } else if (result.risk_score >= 30 || result.recommendation === "review") {
      // Medium: reduce visibility (remove featured/boosted) but keep active
      await base44.asServiceRole.entities.Listing.update(listingId, {
        is_featured: false,
        is_boosted: false,
      });
      actions_taken.push("visibility_reduced");
    }

    // Always log the moderation result
    await base44.asServiceRole.entities.ModerationLog.create({
      listing_id: listingId,
      listing_title: listing.title,
      poster_email: listing.created_by || "",
      risk_score: result.risk_score,
      risk_level: result.risk_level,
      flags: result.flags || [],
      recommendation: result.recommendation,
      explanation: result.explanation,
      duplicate_count: duplicates.length,
      actions_taken,
      admin_reviewed: false,
    });

    return Response.json({
      listing_id: listingId,
      ...result,
      duplicate_count: duplicates.length,
      actions_taken,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});