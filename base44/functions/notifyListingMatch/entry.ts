import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Triggered on Listing create — checks saved searches, nearby events, featured
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const listing = body.data || {};
    const { title, category, location_city, price, is_featured, event_date } = listing;
    const listingId = body.event?.entity_id || listing.id;

    if (!listingId || !title) return Response.json({ skipped: true });

    // 1. Match saved searches
    const savedSearches = await base44.asServiceRole.entities.SavedSearch.filter({ notify: true });
    const notifiedEmails = new Set();

    for (const ss of savedSearches) {
      const qMatch = !ss.query || title?.toLowerCase().includes(ss.query.toLowerCase()) || listing.description?.toLowerCase().includes(ss.query.toLowerCase());
      const catMatch = !ss.category || ss.category === category;
      const cityMatch = !ss.location || location_city?.toLowerCase().includes(ss.location.toLowerCase());
      const priceMatch = !ss.price_max || !price || price <= ss.price_max;

      if (qMatch && catMatch && cityMatch && priceMatch && !notifiedEmails.has(ss.user_email)) {
        notifiedEmails.add(ss.user_email);
        await base44.asServiceRole.entities.Notification.create({
          user_email: ss.user_email,
          type: "saved_search",
          title: `New match: "${title}"`,
          body: `Matches your saved search "${ss.query}"${location_city ? ` in ${location_city}` : ""}${price ? ` · $${price.toLocaleString()}` : ""}`,
          link: `/listing/${listingId}`,
          priority: "normal",
        });
      }
    }

    // 2. Notify about nearby events (event category)
    if (category === "events" && event_date) {
      const eventDate = new Date(event_date);
      const daysUntil = Math.ceil((eventDate - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysUntil >= 0 && daysUntil <= 14) {
        // Notify users who have been active in same city
        const groupsInCity = location_city
          ? await base44.asServiceRole.entities.Group.filter({ city: location_city })
          : [];
        const notifiedForEvent = new Set();
        for (const group of groupsInCity.slice(0, 5)) {
          const posts = await base44.asServiceRole.entities.Post.filter({ group_id: group.id }, "-created_date", 20);
          for (const post of posts) {
            if (post.author_email && !notifiedForEvent.has(post.author_email)) {
              notifiedForEvent.add(post.author_email);
              await base44.asServiceRole.entities.Notification.create({
                user_email: post.author_email,
                type: "nearby_event",
                title: `🎉 Event near you: ${title}`,
                body: `In ${location_city} · ${daysUntil === 0 ? "Today!" : `${daysUntil} days away`}${price ? ` · $${price}` : " · Free"}`,
                link: `/listing/${listingId}`,
                priority: "normal",
              });
            }
          }
        }
      }
    }

    // 3. Featured listing notification to recent active users
    if (is_featured) {
      const recentNotifs = await base44.asServiceRole.entities.Notification.list("-created_date", 50);
      const recentEmails = [...new Set(recentNotifs.map(n => n.user_email))].slice(0, 20);
      for (const email of recentEmails) {
        await base44.asServiceRole.entities.Notification.create({
          user_email: email,
          type: "featured_listing",
          title: `⭐ Featured: ${title}`,
          body: `A new featured listing is available${location_city ? ` in ${location_city}` : ""}${price ? ` · $${price.toLocaleString()}` : ""}`,
          link: `/listing/${listingId}`,
          priority: "low",
        });
      }
    }

    return Response.json({ success: true, matched_searches: notifiedEmails.size });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});