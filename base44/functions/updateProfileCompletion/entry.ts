import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const COMPLETION_TASKS = {
  photo: { name: 'Add profile photo', points: 5, visibility_boost: 15 },
  bio: { name: 'Add bio', points: 3, visibility_boost: 10 },
  email_verified: { name: 'Verify email', points: 10, visibility_boost: 5 },
  interests: { name: 'Select interests', points: 5, visibility_boost: 20 },
  group_joined: { name: 'Join a group', points: 5, visibility_boost: 10 },
  username: { name: 'Set username', points: 3, visibility_boost: 5 },
  phone: { name: 'Add phone number', points: 5, visibility_boost: 10 },
  verified_badge: { name: 'Get verified', points: 15, visibility_boost: 50 },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { completed_tasks } = body;

    // Fetch user's current profile data
    const currentUser = user;
    const previousCompletion = currentUser.profile_completion || {};
    let reputationGain = 0;
    let visibilityBoostGain = 0;
    const newlyCompleted = [];

    // Check each task
    const tasksToCheck = [
      { key: 'photo', check: () => !!currentUser.avatar },
      { key: 'bio', check: () => !!currentUser.bio && currentUser.bio.length > 10 },
      { key: 'email_verified', check: () => !!currentUser.email_verified },
      { key: 'interests', check: () => currentUser.interests && currentUser.interests.length > 0 },
      { key: 'group_joined', check: () => currentUser.joined_groups && currentUser.joined_groups.length > 0 },
      { key: 'username', check: () => !!currentUser.username },
      { key: 'phone', check: () => !!currentUser.phone },
    ];

    for (const task of tasksToCheck) {
      const isCompleted = task.check();
      const wasCompleted = previousCompletion[task.key];

      if (isCompleted && !wasCompleted) {
        // Newly completed
        const reward = COMPLETION_TASKS[task.key];
        reputationGain += reward.points;
        visibilityBoostGain += reward.visibility_boost;
        newlyCompleted.push(task.key);
      }
    }

    // Calculate completion percentage
    const completionStatus = {};
    for (const task of tasksToCheck) {
      completionStatus[task.key] = task.check();
    }

    const completedCount = Object.values(completionStatus).filter(Boolean).length;
    const completionPercentage = Math.round((completedCount / tasksToCheck.length) * 100);

    // Update user with new completion status
    await base44.auth.updateMe({
      profile_completion: completionStatus,
      profile_completion_percentage: completionPercentage,
    });

    // Award reputation and visibility boost if new tasks completed
    if (newlyCompleted.length > 0) {
      const currentReputation = currentUser.reputation_score || 0;
      const currentVisibilityBoost = currentUser.visibility_boost || 0;

      await base44.auth.updateMe({
        reputation_score: currentReputation + reputationGain,
        visibility_boost: currentVisibilityBoost + visibilityBoostGain,
      });
    }

    return Response.json({
      success: true,
      completion_percentage: completionPercentage,
      newly_completed: newlyCompleted,
      reputation_gained: reputationGain,
      visibility_boost_gained: visibilityBoostGain,
      completion_status: completionStatus,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});