import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CATEGORIES = ['cars', 'jobs', 'housing', 'services', 'events', 'electronics', 'community'];
const CITIES = ['Chicago', 'New York', 'Los Angeles', 'Houston', 'Phoenix', 'Denver', 'Seattle', 'Boston', 'Miami', 'Las Vegas'];
const STATES = ['IL', 'NY', 'CA', 'TX', 'AZ', 'CO', 'WA', 'MA', 'FL', 'NV'];
const JOB_TITLES = ['Software Engineer', 'Product Manager', 'Designer', 'Accountant', 'Chef', 'Nurse', 'Electrician', 'Construction Worker'];
const LISTING_TITLES = ['MacBook Pro 16"', '2019 Honda Civic', 'Studio Apartment', 'Python Course', 'Web Design Service', 'iPhone 14', 'DJ Equipment'];
const IMAGE_URLS = [
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400',
  'https://images.unsplash.com/photo-1540932239986-7e149ecca42e?w=400',
  'https://images.unsplash.com/photo-1511315182440-c74e5e47e1d4?w=400',
  'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=400',
];
const POST_CONTENT = [
  'Just moved to this city, looking for friends to hang out with!',
  'Does anyone know a good Mongolian restaurant nearby?',
  'Selling my old furniture, must go ASAP!',
  'Looking for carpool partners to downtown',
  'Best coffee shop in town? Need recommendations!',
  'Community potluck this weekend, everyone welcome!',
  'Has anyone tried that new gym opening?',
  'Free English tutoring available if interested',
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Generate 100 listings
    const listings = [];
    for (let i = 0; i < 100; i++) {
      const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
      const cityIdx = Math.floor(Math.random() * CITIES.length);
      const listing = {
        title: `${LISTING_TITLES[Math.floor(Math.random() * LISTING_TITLES.length)]} #${i + 1}`,
        description: `High quality item, lightly used. Great deal! Item #${i + 1}`,
        category,
        price: Math.floor(Math.random() * 5000) + 100,
        price_type: category === 'jobs' ? 'hourly' : 'fixed',
        location_city: CITIES[cityIdx],
        location_state: STATES[cityIdx],
        images: [IMAGE_URLS[Math.floor(Math.random() * IMAGE_URLS.length)]],
        contact_phone: `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
        contact_email: `seller${i}@example.com`,
        status: 'active',
        is_featured: Math.random() > 0.9,
        is_boosted: Math.random() > 0.8,
        views: Math.floor(Math.random() * 500),
        saves: Math.floor(Math.random() * 100),
        poster_name: `User ${i + 1}`,
        tags: [category],
      };
      listings.push(listing);
    }

    const createdListings = await base44.entities.Listing.bulkCreate(listings);
    console.log(`Created ${createdListings.length} listings`);

    // Get a group for posts (or use first one)
    const groups = await base44.entities.Group.list('-member_count', 1);
    const groupId = groups.length > 0 ? groups[0].id : null;

    if (!groupId) {
      return Response.json({ error: 'No groups found to add posts' }, { status: 400 });
    }

    // Generate 100 posts
    const posts = [];
    for (let i = 0; i < 100; i++) {
      const post = {
        group_id: groupId,
        content: POST_CONTENT[Math.floor(Math.random() * POST_CONTENT.length)] + ` (Post #${i + 1})`,
        author_name: `Member ${i + 1}`,
        author_email: `member${i}@example.com`,
        author_avatar: `https://i.pravatar.cc/150?img=${i}`,
        like_count: Math.floor(Math.random() * 50),
        comment_count: Math.floor(Math.random() * 20),
        repost_count: Math.floor(Math.random() * 10),
        type: 'post',
        reactions: {},
        reposted_by: [],
      };
      posts.push(post);
    }

    const createdPosts = await base44.entities.Post.bulkCreate(posts);
    console.log(`Created ${createdPosts.length} posts`);

    return Response.json({
      success: true,
      listings_created: createdListings.length,
      posts_created: createdPosts.length,
      message: '100 listings and 100 posts created successfully',
    });
  } catch (error) {
    console.error('Seeding error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});