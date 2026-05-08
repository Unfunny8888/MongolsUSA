import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, body, icon, badge, tag, data } = await req.json();

    // Get user's push subscriptions from the database
    // This would be stored when user subscribes to notifications
    const subscriptions = await base44.asServiceRole.entities.PushSubscription.filter({
      user_email: user.email,
      active: true
    });

    if (!subscriptions || subscriptions.length === 0) {
      return Response.json({ sent: 0 });
    }

    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
    const vapidSubject = Deno.env.get('VAPID_SUBJECT') || 'mailto:noreply@nomadlink.app';

    const sendPromises = subscriptions.map(async (sub) => {
      try {
        const response = await fetch(sub.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'TTL': '24'
          },
          body: JSON.stringify({
            notification: {
              title,
              body,
              icon: icon || '/icon-192x192.png',
              badge: badge || '/badge-72x72.png',
              tag: tag || 'notification',
              data: data || {}
            }
          })
        });

        // If subscription is invalid, mark as inactive
        if (response.status === 410 || response.status === 404) {
          await base44.asServiceRole.entities.PushSubscription.update(sub.id, { active: false });
        }

        return { success: response.ok, subscriptionId: sub.id };
      } catch (error) {
        console.error(`Failed to send push to ${sub.endpoint}:`, error);
        return { success: false, error: error.message };
      }
    });

    const results = await Promise.all(sendPromises);
    const successCount = results.filter(r => r.success).length;

    return Response.json({
      sent: successCount,
      total: subscriptions.length,
      results
    });
  } catch (error) {
    console.error('Push notification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});