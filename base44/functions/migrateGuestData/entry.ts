import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { viewed_listings, saved_searches, search_history } = await req.json();

    // Migrate viewed listings
    if (viewed_listings?.length > 0) {
      for (const listing of viewed_listings) {
        try {
          // Create a record of viewed listing for user engagement tracking
          const existingView = await base44.entities.UserView?.filter(
            {
              user_email: user.email,
              listing_id: listing.id,
            },
            null,
            1
          );

          if (!existingView || existingView.length === 0) {
            await base44.entities.UserView?.create({
              user_email: user.email,
              listing_id: listing.id,
              listing_title: listing.title,
              listing_category: listing.category,
              viewed_at: listing.viewed_at,
            });
          }
        } catch (err) {
          console.error(`Failed to migrate listing view ${listing.id}:`, err.message);
        }
      }
    }

    // Migrate saved searches
    if (saved_searches?.length > 0) {
      for (const search of saved_searches) {
        try {
          const existing = await base44.entities.SavedSearch?.filter(
            {
              user_email: user.email,
              query: search.query,
            },
            null,
            1
          );

          if (!existing || existing.length === 0) {
            await base44.entities.SavedSearch.create({
              user_email: user.email,
              query: search.query,
              category: search.filters?.category,
              location: search.filters?.location || 'all',
              price_max: search.filters?.price_max,
              notify: true,
            });
          }
        } catch (err) {
          console.error(`Failed to migrate saved search "${search.query}":`, err.message);
        }
      }
    }

    // Store search history in user metadata
    if (search_history?.length > 0) {
      try {
        await base44.auth.updateMe({
          search_history: search_history.slice(0, 50),
        });
      } catch (err) {
        console.error('Failed to update search history:', err.message);
      }
    }

    return Response.json({
      success: true,
      migrated: {
        listings: viewed_listings?.length || 0,
        searches: saved_searches?.length || 0,
        search_history: search_history?.length || 0,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});