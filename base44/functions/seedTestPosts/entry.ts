import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get list of groups to assign posts to
    let groups = await base44.entities.Group.list();
    if (!groups || groups.length === 0) {
      return Response.json({ error: 'No groups found. Create groups first.' }, { status: 400 });
    }

    const sampleContent = [
      'Just joined this community! Excited to connect with everyone here. 🎉',
      'Has anyone tried the new restaurant downtown? Would love recommendations!',
      'Looking for a carpool buddy for daily commute. Anyone interested? 🚗',
      'Beautiful weather today! Perfect time for a hike. Who else is outdoors?',
      'Just finished reading an amazing book. Would love to discuss it with the group!',
      'Anyone hiring? I\'m looking for freelance opportunities in web design.',
      'Coffee meetup this Saturday at the usual spot. Who\'s in? ☕',
      'Just moved to the area. Any tips for newcomers? Really appreciating the community vibes.',
      'Thinking about starting a book club. Who would be interested? 📚',
      'Great event last weekend! Thanks to everyone who organized it.',
      'Looking for gym buddies. Starting my fitness journey next week! 💪',
      'Does anyone know a good mechanic in the area? Car trouble again...',
      'Loving the community here. You all are amazing! 💙',
      'Anyone interested in learning a new language together?',
      'Just got promoted at work! Celebrating with this amazing community.',
      'What\'s everyone\'s favorite local spot? Always looking for new places to explore.',
      'Planning a group trip. Interested? We\'re thinking of visiting [nearby place].',
      'Thanks for all the advice on my previous post. Really helped me out! 🙏',
      'Anyone play video games? Let\'s start a gaming group!',
      'Just started a new hobby. Would love to share my journey with you all.',
      'The community here is so supportive. Grateful for each one of you!',
      'Anyone interested in starting a cooking club? I love trying new recipes.',
      'Just volunteered at a local charity. It was so fulfilling!',
      'Looking for study partners for upcoming exams. Anyone available?',
      'Met some amazing people at the last community event. This group is special! ✨',
      'Anyone have recommendations for a good coffee place? On a caffeine hunt!',
      'Just started my own business! Super nervous but excited. Any entrepreneurs here?',
      'The support from this community means everything to me. Thank you! 🤗',
      'Anyone interested in outdoor activities? Love hiking, camping, and exploring.',
      'Just discovered an amazing podcast. Highly recommend checking it out!',
    ];

    const firstNames = ['Alex', 'Morgan', 'Jordan', 'Casey', 'Riley', 'Taylor', 'Quinn', 'Drew', 'Avery', 'Parker', 'Sage', 'River', 'Finley', 'Skylar', 'Logan', 'Owen', 'Emma', 'Olivia', 'Ava', 'Isabella'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Lee', 'Chen', 'Kim', 'Kumar', 'Patel'];
    const avatars = [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Morgan',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Casey',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Riley',
    ];

    function getRandomItem(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }

    function getRandomEmail(firstName, lastName) {
      return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}@example.com`;
    }

    const postsToCreate = [];

    for (let i = 0; i < 100; i++) {
      const firstName = getRandomItem(firstNames);
      const lastName = getRandomItem(lastNames);
      const groupId = getRandomItem(groups).id;
      const daysAgo = Math.floor(Math.random() * 60);
      const createdDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

      postsToCreate.push({
        group_id: groupId,
        author_name: `${firstName} ${lastName}`,
        author_email: getRandomEmail(firstName, lastName),
        author_avatar: getRandomItem(avatars),
        content: getRandomItem(sampleContent),
        like_count: Math.floor(Math.random() * 50),
        comment_count: Math.floor(Math.random() * 20),
        repost_count: Math.floor(Math.random() * 10),
        type: Math.random() > 0.8 ? 'announcement' : 'post',
      });
    }

    // Create all posts
    const result = await base44.entities.Post.bulkCreate(postsToCreate);

    return Response.json({
      success: true,
      message: `Created ${result.length || 100} test posts`,
      count: result.length || 100,
    });
  } catch (error) {
    console.error('Error seeding posts:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});